import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generates a dynamic system prompt for the AI model, instructing it
 * to respond in the specified language.
 * @param locale The language code ('en', 'fr', 'ko').
 * @returns A string containing the full system prompt.
 */
const getReportGenPrompt = (locale: string) => {
    // Map locale codes to full language names for better clarity to the AI
    const languageMap: { [key: string]: string } = {
        en: 'English',
        fr: 'French',
        ko: 'Korean'
    };
    const targetLanguage = languageMap[locale] || 'English';

    // The prompt is now a function that incorporates the target language
    return `You are an AI Travel Agent that just finished a voice conversation with a user. Based on the travel AI agent info and the conversation between the AI travel agent and the user, generate a structured travel report.

    IMPORTANT: You MUST generate the entire response and all text within the JSON object in the following language: **${targetLanguage}**.

    The report must contain the following fields:
    1. agent: the travel specialist name (e.g., "CityExplorer AI")  
    2. user: name of the traveler or "Anonymous" if not provided  
    3. timestamp: current date and time in ISO format  
    4. tripPurpose: one‐sentence summary of why the user is traveling
    5. summary: a 2–3 sentence overview of the conversation
    6. currentLocation: the user’s last known GPS‐derived location or city  
    7. recommendedItinerary: an ordered list of POIs or activities suggested, each with mode of transport and estimated times  
    8. transportationUpdates: list of any real‐time issues mentioned
    9. weatherAlerts: list of any weather conditions or forecasts that could affect travel
    10. crowdAlerts: list of any crowd or obstruction warnings from user’s camera input
    11. recommendations: list of AI suggestions

    Return the result in this exact JSON format (only include fields that have data):

    \`\`\`json
    {
      "agent": "string",
      "user": "string",
      "timestamp": "ISO Date string",
      "tripPurpose": "string",
      "summary": "string",
      "currentLocation": "string",
      "recommendedItinerary": [
        {
          "place": "string",
          "mode": "string",
          "eta": "string"
        }
      ],
      "transportationUpdates": ["string"],
      "weatherAlerts": ["string"],
      "crowdAlerts": ["string"],
      "recommendations": ["string"]
    }
    \`\`\`

    Respond with nothing else.`;
}


export async function POST(req: NextRequest) {
    // Destructure `locale` from the request body, with a fallback to 'en'
    const { sessionId, sessionDetail, messages, locale = 'en' } = await req.json();
    
    // Get the localized system prompt
    const REPORT_GEN_PROMPT = getReportGenPrompt(locale);
  
    try {
      const userInput =
        'AI Travel Agent Info:' +
        JSON.stringify(sessionDetail) +
        ', Conversation:' +
        JSON.stringify(messages);
  
      const completion = await openai.chat.completions.create({
        model: 'google/gemini-2.5-flash-preview-05-20',
        messages: [
          { role: 'system', content: REPORT_GEN_PROMPT },
          { role: 'user', content: userInput },
        ],
      });
  
      // Parse the JSON response from the AI
      const raw = completion.choices[0].message?.content?.trim() ?? '';
      const jsonString = raw.replace(/^```json\s*/, '').replace(/```$/, '');
      const report = JSON.parse(jsonString);
  
      // Persist the translated report to the database
      await db
        .update(SessionChatTable)
        .set({
          report,
          conversation: messages,
        })
        .where(eq(SessionChatTable.sessionId, sessionId));
  
      return NextResponse.json(report);
    } catch (err) {
      console.error('REPORT GENERATION ERROR', err);
      // It's good practice to cast the error to get better type info
      const errorMessage = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
}

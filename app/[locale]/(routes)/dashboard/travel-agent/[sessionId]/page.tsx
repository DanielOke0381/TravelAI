"use client"

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { travelAgent } from '../../_components/TravelAgentCard';
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';
import { useLocale } from 'next-intl'; // Import the useLocale hook

export type SessionDetail = {
    id: number,
    notes: string,
    sessionId: string,
    report: JSON,
    selectedAgent: travelAgent,
    createdOn: string,
}

type messages = {
    role: string,
    text: string
}

/**
 * TravelVoiceAgent Component
 * * Provides the main voice interaction interface. It now captures the current
 * language locale and sends it to the backend to ensure the AI report
 * is generated in the user's selected language.
 */
function TravelVoiceAgent() {
    const { sessionId } = useParams();
    const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
    const [callStarted, setCallStarted] = useState(false);
    const [vapiInstance, setVapiInstance] = useState<any>(null);
    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const [liveTranscript, setLiveTranscript] = useState<string>('');
    const [messages, setMessages] = useState<messages[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const locale = useLocale(); // Get the current locale ('en', 'fr', or 'ko')

    useEffect(() => {
        if (sessionId) GetSessionDetails();
    }, [sessionId]);

    const GetSessionDetails = async () => {
        // Corrected API endpoint after cleanup
        const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
        setSessionDetail(result.data);
    };

    const StartCall = () => {
        // ... (StartCall logic remains the same)
        if (!sessionDetail) return;
        setLoading(true);

        const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
        setVapiInstance(vapi);

        const VapiAgentConfig = {
            name: 'AI Travel Voice Agent',
            firstMessage: "Hi there! I'm your AI Travel Assistant. How can I help with your travel plans today?",
            transcriber: {
                provider: 'assembly-ai',
                language: 'en'
            },
            voice: {
                provider: 'playht',
                voiceId: sessionDetail.selectedAgent?.voiceId ?? 'will'
            },
            model: {
                provider: 'openai',
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: sessionDetail.selectedAgent?.agentPrompt
                    }
                ]
            }
        };

        //@ts-ignore
        vapi.start(VapiAgentConfig);

        vapi.on('call-start', () => { setLoading(false); setCallStarted(true); });
        vapi.on('call-end', () => { setCallStarted(false); setVapiInstance(null); });
        vapi.on('message', (message) => {
            if (message.type === 'transcript') {
                const { role, transcriptType, transcript } = message;
                if (transcriptType === 'partial') {
                    setLiveTranscript(transcript);
                    setCurrentRole(role);
                } else if (transcriptType === 'final') {
                    setMessages((prev) => [...prev, { role, text: transcript }]);
                    setLiveTranscript('');
                    setCurrentRole(null);
                }
            }
        });
        vapi.on('speech-start', () => { setCurrentRole('assistant'); });
        vapi.on('speech-end', () => { setCurrentRole('user'); });
    };

    const endCall = async () => {
        await GenerateReport(); // Generate report before ending the call
        if (!vapiInstance) return;

        vapiInstance.stop();
        vapiInstance.off('call-start');
        vapiInstance.off('call-end');
        vapiInstance.off('message');
        vapiInstance.off('speech-start');
        vapiInstance.off('speech-end');

        setCallStarted(false);
        setVapiInstance(null);

        toast.success('Your report is generated!');
        router.replace('/dashboard');
    };

    /**
     * GenerateReport
     * Sends the conversation and session details to the backend, now including
     * the current locale to get a translated report.
     */
    const GenerateReport = async () => {
        setLoading(true);
        // Corrected API endpoint after cleanup
        const result = await axios.post('/api/travel-report', {
            messages: messages,
            sessionDetail: sessionDetail,
            sessionId: sessionId,
            locale: locale // <-- Pass the current locale to the backend
        });

        console.log(result.data);
        setLoading(false);
        return result.data;
    };

    // The JSX for rendering the component remains the same
    return (
        <div className='p-5 border rounded-3xl bg-secondary'>
            <div className='flex justify-between items-center'>
                <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'>
                    <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`} />
                    {callStarted ? 'Connected...' : 'Not Connected'}
                </h2>
                <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
            </div>
            {sessionDetail && (
                <div className='flex items-center flex-col mt-10'>
                    <Image
                        src={sessionDetail.selectedAgent?.image}
                        alt={sessionDetail.selectedAgent?.title ?? ''}
                        width={120}
                        height={120}
                        className='h-[100px] w-[100px] object-cover rounded-full'
                    />
                    <h2 className='mt-2 text-lg'>{sessionDetail.selectedAgent?.title}</h2>
                    <p className='text-sm text-gray-400'>AI Travel Voice Agent</p>
                    <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
                        {messages.slice(-4).map((msg, index) => (
                            <h2 className='text-gray-400 p-2' key={index}>
                                {msg.role}: {msg.text}
                            </h2>
                        ))}
                        {liveTranscript && (
                            <h2 className='text-lg'>
                                {currentRole} : {liveTranscript}
                            </h2>
                        )}
                    </div>
                    {!callStarted ? (
                        <Button className='mt-20' onClick={StartCall} disabled={loading}>
                            {loading ? <Loader className='animate-spin' /> : <PhoneCall />} Start Call
                        </Button>
                    ) : (
                        <Button variant='destructive' onClick={endCall} disabled={loading}>
                            {loading ? <Loader className='animate-spin' /> : <PhoneOff />} Disconnect
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TravelVoiceAgent;

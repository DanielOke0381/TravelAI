import { NextIntlClientProvider, useMessages } from 'next-intl';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Provider from '../provider'; // This path is now correct
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Travel Voice Agent",
  description: "Your personal AI-powered tour guide and trip planner.",
};

export default function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = useMessages();

  return (
    <ClerkProvider>
      <html lang={locale}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            {/* The Provider component wraps your main application content */}
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

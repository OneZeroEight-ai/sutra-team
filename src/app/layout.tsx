import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EcosystemBanner } from "@/components/layout/EcosystemBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sutra.team — Persona Hosting Platform",
    template: "%s | Sutra.team",
  },
  description:
    "An ensemble agent deliberation system where multiple AI personas analyze your question and a synthesis agent reconciles their perspectives into one unified answer.",
  openGraph: {
    title: "Sutra.team — Persona Hosting Platform",
    description:
      "Your AI needs a council, not a chatbot. Multiple agents deliberate — Sutra synthesizes.",
    url: "https://sutra.team",
    siteName: "Sutra.team",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sutra-bg text-sutra-text`}
      >
        <EcosystemBanner />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  metadataBase: new URL("https://sutra.team"),
  title: {
    default: "Sutra.team — Your AI Agency",
    template: "%s | Sutra.team",
  },
  description:
    "Build AI agents. Assign roles. Command them across Telegram, Slack, email, and more. Every action governed by 8 security layers. Start free.",
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Sutra.team — Your AI Agency",
    description:
      "Build agents. Assign roles. Command them anywhere. Protected by Samm\u0101 Suit.",
    images: [{ url: "/images/og/og-default.png", width: 1200, height: 630 }],
    siteName: "Sutra.team",
    type: "website",
    url: "https://sutra.team",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sutra.team — Your AI Agency",
    description:
      "Build agents. Assign roles. Command them anywhere. Protected by Samm\u0101 Suit.",
    images: ["/images/og/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sutra.team"),
  title: {
    default: "SUTRA.team \u2014 The First OS for Autonomous Agents",
    template: "%s | Sutra.team",
  },
  description:
    "Create your own AI agency in minutes. 15 prebuilt agents. Open source. OpenClaw compatible. 8 layers of Samm\u0101 Suit security. Easy enough for anyone, powerful enough for Fortune 500.",
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SUTRA.team \u2014 The First OS for Autonomous Agents",
    description:
      "Create your own AI agency. 15 PMF agents. Open source. Secure by default.",
    images: [{ url: "/images/og/og-default.png", width: 1200, height: 630 }],
    siteName: "SUTRA.team",
    type: "website",
    url: "https://sutra.team",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUTRA.team \u2014 The First OS for Autonomous Agents",
    description:
      "Create your own AI agency. 15 PMF agents. Open source. Secure by default.",
    creator: "@sutra_ai",
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
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased bg-sutra-bg text-sutra-text`}
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

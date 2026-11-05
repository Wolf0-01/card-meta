import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  title: "Card Meta | Duel Links Decks, Tier List y Noticias",

  description:
    "Plataforma de Duel Links con decks competitivos, tier list, cartas, torneos y noticias del meta.",

  applicationName: "Card Meta",

  keywords: [
    "Yu-Gi-Oh!",
    "Duel Links",
    "Card Meta",
    "Deck",
    "Deck Builder",
    "Tier List",
    "Meta",
    "Cards",
    "Database",
    "Yu-Gi-Oh! Duel Links",
  ],

  authors: [
    {
      name: "Card Meta",
    },
  ],

  creator: "Card Meta",

  metadataBase: new URL("https://cardmeta.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen
          flex
          flex-col
          antialiased
        "
      >
        <Navbar />

        <main
          id="main-content"
          className="flex-1"
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar Tea — Web3 Bubble Tea Adventure",
  description:
    "Enter Stellar Tea: craft, mix, and trade NFT bubble teas in a collaborative play-to-earn universe powered by the Stellar network.",
  openGraph: {
    title: "Stellar Tea — Web3 Bubble Tea Adventure",
    description:
      "Collect vibrant bubble tea NFTs, mix flavors with friends, and master a dual-token economy inside the Stellar ecosystem.",
    url: "https://stellar-tea.io",
    siteName: "Stellar Tea",
    images: [
      {
        url: "/design/nft/stellar-tea-001.png",
        width: 1200,
        height: 630,
        alt: "Stellar Tea NFT assortment",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stellar Tea — Web3 Bubble Tea Adventure",
    description:
      "Discover a sugary-smooth onboarding into Stellar with co-op mixing, a dual-token economy, and vivid NFT teas.",
    images: ["/design/nft/stellar-tea-002.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

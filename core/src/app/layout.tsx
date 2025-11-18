import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import NavBar from "./components/NavBar";
import Provider from "./components/Provider";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import Footer from "./components/Footer";
import AdSlot from "./components/AdSlot";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "test quiz",
  description: "quiz",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const bottomAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM;
  
  return (
    <html lang="en">
      <body>
        {adsenseClient ? (
          <Script
            id="adsense-loader"
            strategy="afterInteractive"
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        ) : null}
        <Provider>
        <NavBar />
        {children}
        {bottomAdSlot ? (
          <AdSlot slot={bottomAdSlot} className="bottom-banner-ad" />
        ) : null}
        <Footer />
        <SpeedInsights />
        <Analytics />
        </Provider>
      </body>
    </html>
  );
}

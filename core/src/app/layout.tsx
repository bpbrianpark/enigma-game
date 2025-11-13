import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import NavBar from "./components/NavBar";
import Provider from "./components/Provider";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import Footer from "./components/Footer";

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
  
  return (
    <html lang="en">
      <body>
        <Provider>
        <NavBar />
        {children}
        <Footer />
        <Analytics />
        </Provider>
      </body>
    </html>
  );
}

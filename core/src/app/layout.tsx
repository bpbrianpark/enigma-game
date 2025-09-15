import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import NavBar from "./components/NavBar";
import Provider from "./components/Provider";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

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
        <Analytics />
        </Provider>
      </body>
    </html>
  );
}

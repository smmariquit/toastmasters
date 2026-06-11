// src/app/layout.tsx

import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Toastmasters Hub - Meeting Management",
  description: "A comprehensive meeting management tool for Toastmasters clubs. Track speeches, manage roles, and improve your public speaking journey.",
  icons: {
    icon: '/favicon.svg',
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
        className={`${lexend.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-1 pt-[1px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

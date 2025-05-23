import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
  title: "Ducky&apos;s Birthday Countdown!",
  description: "Countdown to Ducky&apos;s special day!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        {/* Background image */}
        <div className="fixed inset-0 -z-10">
          <Image
            src="/luxury-bg.jpg"
            alt="Luxury background"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            className="blur-sm brightness-75"
            draggable="false"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
        </div>
        {children}
      </body>
    </html>
  );
}

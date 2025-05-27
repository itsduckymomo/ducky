import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import Image from "next/image"; // Removed Image import
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
  title: "Ducky's Birthday Countdown! 🎂",
  description: "Join us in celebrating Ducky's next birthday! A fun, modern countdown timer to the special day. Don't miss out!",
  keywords: ["Ducky", "Birthday", "Countdown", "Celebration", "Party", "Next.js", "React"],
  authors: [{ name: "Sky" }],
  creator: "Sky",
  publisher: "Sky",
  openGraph: {
    title: "Ducky's Awesome Birthday Countdown!",
    description: "The official countdown to Ducky's upcoming birthday. Get ready to celebrate!",
    url: "https://yourwebsite.com", // Replace with your actual domain
    siteName: "Ducky's Birthday Bash",
    images: [
      {
        url: "/android-chrome-512x512.png", // Path to a good preview image
        width: 512,
        height: 512,
        alt: "Ducky's Birthday Countdown Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ducky's Birthday Countdown Extravaganza!",
    description: "Counting down the days, hours, minutes, and seconds to Ducky's birthday!",
    // siteId: "yourTwitterSiteId", // Optional: Your Twitter Site ID
    creator: "@YourTwitterHandle", // Optional: Your Twitter handle
    // creatorId: "yourTwitterCreatorId", // Optional: Your Twitter Creator ID
    images: ["/android-chrome-512x512.png"], // Must be a URL string
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* The following tags are often automatically handled by Next.js if 'metadata.manifest' is set, but explicitly adding them ensures compatibility */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        {/* Consider adding theme-color here if not covered by manifest or if you want it to apply more broadly */}
        {/* <meta name="theme-color" content="#8b5cf6" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        {/* Background image and overlay removed */}
        {/* <div className="fixed inset-0 -z-10">
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
        </div> */}
        {children}
      </body>
    </html>
  );
}

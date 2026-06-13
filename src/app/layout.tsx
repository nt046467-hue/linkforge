import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkForge — AI-Powered Bio Link Builder",
  description: "Build your perfect link-in-bio page in 30 seconds with AI. Beautiful themes, analytics, and custom domains.",
  keywords: ["link in bio", "bio link", "link page", "AI", "LinkForge"],
  authors: [{ name: "LinkForge" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "1024x1024" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1F',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F2F2F4',
            },
          }}
        />
      </body>
    </html>
  );
}

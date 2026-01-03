import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessProvider } from "@/components/auth/AccessProvider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e1b4b",
};

export const metadata: Metadata = {
  title: "OfferMitra - AI Offer Generator",
  description: "Generate WhatsApp offers for your shop instantly in Hindi/Hinglish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={inter.className}>
        <AccessProvider>
          {children}
        </AccessProvider>
      </body>
    </html>
  );
}

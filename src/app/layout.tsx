import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google"; // Use Outfit as it's modern and good for Hindi too if needed
import "./globals.css";
import { AccessProvider } from "@/components/auth/AccessProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
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
        {/* No more Razorpay script needed here */}
      </head>
      <body className={outfit.className}>
        <AccessProvider>
          {children}
        </AccessProvider>
      </body>
    </html>
  );
}

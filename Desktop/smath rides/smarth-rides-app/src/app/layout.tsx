import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmartAssistant from "@/components/chat/SmartAssistant";
import NotificationToast from "@/components/notifications/NotificationToast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smarth Rides",
  description: "Apna local auto app – gaon se sheher tak",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFD700",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <SmartAssistant />
        <NotificationToast />
      </body>
    </html>
  );
}

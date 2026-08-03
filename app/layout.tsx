import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/cart/CartProvider";
import { MotionEditorShell } from "@/components/motion/MotionEditorShell";
import { MotionRuntimeStyles } from "@/components/motion/MotionRuntimeStyles";
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
  title: "Dinnerz Done",
  description: "Order tomorrow's dinner tonight — local dinner to your door.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dinnerz Done",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
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
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background">
          <CartProvider>
            <MotionEditorShell>
              <MotionRuntimeStyles />
              {children}
            </MotionEditorShell>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

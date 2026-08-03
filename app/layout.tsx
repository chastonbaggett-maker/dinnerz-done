import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/cart/CartProvider";
import { AppLoadHost } from "@/components/motion/AppLoadHost";
import { AppLoadPrehideStyles } from "@/components/motion/AppLoadPrehideStyles";
import { readPublishedMotionSpecs } from "@/lib/motion/published-store";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const motion = await readPublishedMotionSpecs();

  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background">
          <AppLoadPrehideStyles appLoad={motion.appLoad} />
          <CartProvider>
            <AppLoadHost initialAppLoad={motion.appLoad}>{children}</AppLoadHost>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

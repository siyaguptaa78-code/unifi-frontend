import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unifi Cafe — Multi-location Cafe Membership & Access Platform",
  description: "Seamless cafe memberships, NFC/RFID check-in, points wallet, food ordering and multi-unit franchise management.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-stone-950 text-stone-100 min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


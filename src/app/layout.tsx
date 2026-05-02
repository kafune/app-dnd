import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HydrationGate } from "@/components/HydrationGate";
import { ToastViewport } from "@/components/ui/ToastViewport";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mundo Pankleos — D&D",
  description: "Webapp de fichas para Mundo Pankleos.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HydrationGate>
          {children}
          <ToastViewport />
        </HydrationGate>
      </body>
    </html>
  );
}

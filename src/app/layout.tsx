import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Sora, Syne } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Sora({ subsets: ["latin"], variable: "--font-sans" });
const brand = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-brand" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Winroom — The AI capture desk",
  description:
    "Supercharge government contract bidding with AI. Analyze RFPs, score go/no-go, and draft volumes in one capture desk.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${brand.variable} ${display.variable} ${mono.variable} font-sans bg-canvas text-navy`}
      >
        {children}
        <Toaster theme="dark" richColors position="bottom-right" />
      </body>
    </html>
  );
}

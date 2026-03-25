import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
export const metadata: Metadata = { title: "Video Production Tracker" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><Script src="https://js.live.net/v7.2/OneDrive.js" strategy="beforeInteractive"/>{children}</body></html>);
}
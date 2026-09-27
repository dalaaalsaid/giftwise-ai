import type { Metadata } from "next";
import "./globals.css";

import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title:
    "GiftWise AI | Find the Perfect Gift",
  description:
    "AI-powered personalized gift shop for thoughtful gifts, custom gift boxes, and last-minute surprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
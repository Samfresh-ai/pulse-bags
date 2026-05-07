import type { Metadata } from "next";
import "./globals.css";
import { PrivyClientProvider } from "@/components/privy-client-provider";

export const metadata: Metadata = {
  title: "Pulse — Bags fan CRM",
  description: "Discover, rank, and reward Bags token holders with a creator-native fan CRM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col"><PrivyClientProvider>{children}</PrivyClientProvider></body>
    </html>
  );
}

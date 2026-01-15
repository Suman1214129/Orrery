import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orrery - Your Premium Second Brain",
  description: "A sophisticated note-taking and knowledge management platform with AI-powered thinking, narrative exploration, and visual knowledge mapping.",
  keywords: ["note-taking", "knowledge management", "second brain", "AI writing", "graph visualization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

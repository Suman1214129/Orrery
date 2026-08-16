import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workspace",
  description: "A beautifully crafted personal knowledge base.",
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

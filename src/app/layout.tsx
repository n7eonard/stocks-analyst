import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wall Street Analyzer",
  description: "Professional stock analysis powered by Wall Street's best analyst frameworks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

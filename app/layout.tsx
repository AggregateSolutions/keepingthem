import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "keepingthem.net — Multicultural Digital Memorials",
  description: "A place to keep them, in the tradition of their people.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

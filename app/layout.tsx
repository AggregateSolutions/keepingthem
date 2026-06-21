import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "keepingthem.net — Multicultural Digital Memorials",
  description: "A place to keep them, in the tradition of their people.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "keepingthem.net — Multicultural Digital Memorials",
    description: "A place to keep them, in the tradition of their people.",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
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

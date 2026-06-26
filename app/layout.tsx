import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager",
  description:
    "Task Manager full-stack sviluppato con Next.js, TypeScript e SQLite come prova tecnica per una posizione Fullstack Developer.",
  applicationName: "Task Manager",
  authors: [
    {
      name: "Alberto Ricchiuti",
    },
  ],
  keywords: [
    "Task Manager",
    "Next.js",
    "TypeScript",
    "SQLite",
    "REST API",
    "Fullstack",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}

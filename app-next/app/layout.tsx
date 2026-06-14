import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Engineering Mastery Hub — 2026 Edition",
  description:
    "A self-paced course to master production AI engineering: RAG, agents, harnesses, evals, and the judgment to ship. 21 modules, quizzes, flashcards, and real-world scenarios.",
  openGraph: {
    title: "AI Engineering Mastery Hub",
    description:
      "Master production AI engineering — RAG, agents, evals, and the judgment to ship.",
    type: "website",
  },
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

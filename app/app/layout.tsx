import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Worlds",
  description:
    "A multiverse story studio where your characters are remembered.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--border)] bg-white/85 backdrop-blur">
          <nav
            className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-black tracking-tight text-[var(--ink)]"
            >
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl bg-[var(--purple)] text-white"
              >
                ✦
              </span>
              Story Worlds
            </Link>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Link href="/" className="nav-link">
                Characters
              </Link>
              <Link href="/story" className="nav-link">
                Tell a Story
              </Link>
              <Link href="/debug" className="nav-link text-[var(--muted)]">
                Developer
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          {children}
        </main>
      </body>
    </html>
  );
}

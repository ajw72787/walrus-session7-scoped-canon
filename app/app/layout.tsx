import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walrus Session 7",
  description: "Continuity Keeper baseline experiment harness",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--border)] bg-black/20 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="font-semibold tracking-tight hover:text-violet-300"
            >
              Walrus Session 7
            </Link>
            <div className="flex gap-5 text-sm text-[var(--muted)]">
              <Link href="/create" className="hover:text-white">
                Create
              </Link>
              <Link href="/story" className="hover:text-white">
                Story
              </Link>
              <Link href="/debug" className="hover:text-white">
                Debug
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-12">{children}</main>
      </body>
    </html>
  );
}

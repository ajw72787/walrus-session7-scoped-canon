import Link from "next/link";
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-black/10 ${className}`}
    >
      {children}
    </section>
  );
}

export function ActionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-lg border px-4 py-2.5 text-sm font-semibold ${secondary ? "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-high)]" : "border-violet-400/20 bg-violet-600 hover:bg-violet-500"}`}
    >
      {children}
    </Link>
  );
}

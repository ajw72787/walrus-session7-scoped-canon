import Link from "next/link";
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1 text-xs font-black text-[var(--purple-dark)]">
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
      className={`rounded-3xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_0_rgba(78,57,120,.06)] ${className}`}
    >
      {children}
    </section>
  );
}
export function ActionLink({
  href,
  children,
  secondary = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border-2 px-5 py-3 font-bold ${secondary ? "border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--surface-high)]" : "border-[var(--purple)] bg-[var(--purple)] text-white hover:border-[var(--purple-dark)] hover:bg-[var(--purple-dark)]"} ${className}`}
    >
      {children}
    </Link>
  );
}
export function Button({
  children,
  secondary = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      {...props}
      className={`min-h-12 rounded-xl border-2 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50 ${secondary ? "border-[var(--border)] bg-white hover:bg-[var(--surface-high)]" : "border-[var(--purple)] bg-[var(--purple)] text-white hover:bg-[var(--purple-dark)]"} ${className}`}
    >
      {children}
    </button>
  );
}

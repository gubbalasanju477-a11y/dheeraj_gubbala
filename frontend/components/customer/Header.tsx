"use client";

import Link from "next/link";
import { Printer } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#help", label: "Help" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Printer className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            PrintEase
          </span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/print/upload"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-accent-hover"
        >
          Start Printing
        </Link>
      </div>
    </header>
  );
}

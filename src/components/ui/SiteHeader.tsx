"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

/** Sticky top bar shared across pages. `right` slots page-specific controls. */
export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo className="min-w-0 flex-1 sm:flex-none" />
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {right}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <HeaderLink href="/patient">Patient</HeaderLink>
            <HeaderLink href="/staff">Staff</HeaderLink>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  // Active when on the page itself or any of its sub-routes (e.g. /staff/[id]).
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
        active
          ? "bg-brand-500/12 text-brand-700 ring-1 ring-inset ring-brand-500/25 dark:bg-brand-500/15 dark:text-brand-200"
          : "text-muted hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-200",
      )}
    >
      {children}
    </Link>
  );
}

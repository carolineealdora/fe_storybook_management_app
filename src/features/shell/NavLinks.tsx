"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/books", label: "Master book" },
  { href: "/subscription", label: "Subscription" },
] as const;

/** Reads the URL, so it must render inside <Suspense> (fallback: <NavList />). */
export function NavLinks() {
  return <NavList pathname={usePathname()} />;
}

export function NavList({ pathname = "" }: { pathname?: string }) {
  return (
    <ul className="flex gap-1 md:flex-col">
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-9.5 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-nav-accent ${active ? "bg-nav-active text-white" : "text-nav-dim hover:bg-nav-active/60"}`}
            >
              <span
                aria-hidden
                className={`h-4.5 w-0.75 rounded-xs ${active ? "bg-brand-mark" : "bg-transparent"}`}
              />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

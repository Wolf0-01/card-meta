"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import GlobalCardSearch from "@/components/search/GlobalCardSearch";
import UserMenu from "@/components/auth/UserMenu";

const navigation = [
  { href: "/decks", label: "Top Decks" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/guides", label: "Guides" },
  { href: "/news", label: "News" },
];

const mobileNavigation = [
  { href: "/decks", label: "Top Decks: Speed" },
  { href: "/decks?format=rush", label: "Top Decks: Rush" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/guides", label: "Guides" },
  { href: "/news", label: "News & Updates" },
  { href: "/decks/new", label: "Deck Builder" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Izquierda: Botón hamburguesa en móvil + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background-secondary text-foreground transition-colors hover:border-primary/60 hover:text-primary md:hidden"
          >
            {mobileOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="shrink-0 text-xl font-extrabold tracking-wide text-foreground transition-colors duration-200 hover:text-primary sm:text-2xl"
          >
            Card Meta
          </Link>
        </div>

        {/* Navegación central en escritorio */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-foreground"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Derecha: Buscador + Menú de usuario */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GlobalCardSearch />
          <UserMenu />
        </div>
      </div>

      {/* Menú desplegable en móvil */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 shadow-xl md:hidden">
          <div className="grid grid-cols-1 gap-1">
            {mobileNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-background-secondary hover:text-foreground"
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className="text-xs text-foreground-muted">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

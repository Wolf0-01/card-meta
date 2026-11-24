import Link from "next/link";

import GlobalCardSearch from "@/components/search/GlobalCardSearch";

import UserMenu from "@/components/auth/UserMenu";

const navigation = [
  { href: "/decks", label: "Top Decks" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/guides", label: "Guides" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="
            shrink-0
            text-2xl
            font-extrabold
            tracking-wide
            text-foreground
            transition-colors
            duration-200
            hover:text-primary
          "
        >
          Card Meta
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                text-sm
                font-medium
                text-foreground-secondary
                transition-colors
                duration-200
                hover:text-foreground
              "
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">

          <GlobalCardSearch />

          <UserMenu />

        </div>

      </div>
    </nav>
  );
}

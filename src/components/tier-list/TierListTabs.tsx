import Link from "next/link";

import {
  Rocket,
  Zap,
} from "lucide-react";

import type { DuelFormat } from "@/lib/tier-list";

const TABS = [
  {
    key: "speed",
    label: "Speed",
    icon: Zap,
  },
  {
    key: "rush",
    label: "Rush",
    icon: Rocket,
  },
] as const;

interface TierListTabsProps {
  format: DuelFormat;
}

/**
 * Pestañas de formato. El estado activo se refleja en la
 * URL para que la vista se pueda compartir y recargar.
 */
export default function TierListTabs({
  format,
}: TierListTabsProps) {
  return (
    <nav
      aria-label="Tier list format"
      className="
        inline-flex
        items-center
        gap-1
        rounded-lg
        border
        border-slate-700/70
        bg-[#070D1F]
        p-1
      "
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = format === key;

        return (
          <Link
            key={key}
            href={`/tier-list?format=${key}`}
            aria-current={active ? "page" : undefined}
            className={`
              inline-flex
              h-7
              items-center
              gap-1
              rounded-md
              px-2.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              transition-colors
              ${
                active
                  ? "bg-blue-500/15 text-blue-100 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]"
                  : "text-slate-500 hover:text-slate-200"
              }
            `}
          >
            <Icon className="h-3 w-3" />

            {label}
          </Link>
        );
      })}
    </nav>
  );
}

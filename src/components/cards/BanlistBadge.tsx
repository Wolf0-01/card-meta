import { Ban } from "lucide-react";

import {
  getBanlistLabel,
  type BanlistStatus,
} from "@/lib/banlist";

interface BanlistBadgeProps {
  status?: BanlistStatus | null;

  size?: "sm" | "md" | "lg";

  className?: string;
}

const STATUS_STYLES: Record<
  BanlistStatus,
  string
> = {
  forbidden:
    "border-red-300/70 bg-red-600 text-white",

  limited1:
    "border-orange-300/70 bg-orange-500 text-white",

  limited2:
    "border-amber-300/70 bg-amber-500 text-amber-950",

  limited3:
    "border-yellow-300/70 bg-yellow-400 text-yellow-950",
};

const SIZE_STYLES = {
  sm: "h-5 w-5 text-[9px]",

  md: "h-6 w-6 text-[11px]",

  lg: "h-8 w-8 text-sm",
};

/**
 * Icono circular oficial de la banlist de Duel Links.
 * Se coloca en la esquina superior izquierda de la carta.
 */
export default function BanlistBadge({
  status,
  size = "sm",
  className = "",
}: BanlistBadgeProps) {
  if (!status) {
    return null;
  }

  const label = getBanlistLabel(status);

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`
        inline-flex
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        font-black
        leading-none
        shadow-[0_2px_8px_rgba(0,0,0,0.6)]
        ring-1
        ring-black/30
        ${SIZE_STYLES[size]}
        ${STATUS_STYLES[status]}
        ${className}
      `}
    >
      {status === "forbidden" ? (
        <Ban
          aria-hidden
          className="h-[62%] w-[62%]"
          strokeWidth={3}
        />
      ) : (
        <span aria-hidden>
          {status === "limited1"
            ? "1"
            : status === "limited2"
              ? "2"
              : "3"}
        </span>
      )}
    </span>
  );
}

import {
  getBanlistLabel,
  type BanlistStatus,
} from "@/lib/banlist";

interface BanlistBadgeProps {
  status?: BanlistStatus | null;

  size?: "sm" | "md" | "lg";

  className?: string;
}

const SIZE_STYLES = {
  sm: "h-5 w-5 text-[9px]",

  md: "h-6 w-6 text-[11px]",

  lg: "h-8 w-8 text-sm",
};

/**
 * Insignia oficial de la banlist de Duel Links.
 *
 * Reproduce el icono del juego: círculo negro con anillo
 * rojo grueso y el número en dorado. Forbidden usa el mismo
 * círculo con una barra diagonal roja. Las cartas sin
 * restricción no renderizan insignia.
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
        border-[2.5px]
        border-red-600
        bg-black
        font-black
        leading-none
        text-amber-400
        shadow-[0_2px_8px_rgba(0,0,0,0.65)]
        ${SIZE_STYLES[size]}
        ${className}
      `}
    >
      {status === "forbidden" ? (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-[72%] w-[72%]"
        >
          <line
            x1="4.5"
            y1="4.5"
            x2="19.5"
            y2="19.5"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            className="text-red-600"
          />
        </svg>
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

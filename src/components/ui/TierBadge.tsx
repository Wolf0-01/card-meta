interface TierBadgeProps {
  tier: string | null;
}

const variants = {
  "Tier 0": {
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },

  "Tier 1": {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },

  "Tier 2": {
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    text: "text-green-400",
  },

  "Tier 3": {
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    text: "text-orange-400",
  },

  Rogue: {
    bg: "bg-zinc-500/15",
    border: "border-zinc-500/30",
    text: "text-zinc-400",
  },
} as const;

export default function TierBadge({
  tier,
}: TierBadgeProps) {
  const value = tier ?? "Rogue";

  const colors =
    variants[value as keyof typeof variants] ??
    variants.Rogue;

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${colors.bg}
        ${colors.border}
        ${colors.text}
      `}
    >
      {value}
    </span>
  );
}
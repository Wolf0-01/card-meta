import type {
ReactNode,
} from "react";

export type CardBadgeVariant =
| "rarity"
| "monster"
| "spell"
| "trap"
| "limit"
| "default";

interface CardBadgeProps {
children: ReactNode;

variant?: CardBadgeVariant;

className?: string;
}

const variants: Record<
CardBadgeVariant,
string

> = {
rarity: `     border-yellow-500/30
   bg-yellow-500/15
    text-yellow-400
  `,

monster: `     border-red-500/30
    bg-red-500/15
    text-red-400
  `,

spell: `     border-green-500/30
    bg-green-500/15
    text-green-400
  `,

trap: `     border-purple-500/30
    bg-purple-500/15
    text-purple-400
  `,

limit: `     border-blue-500/30
    bg-blue-500/15
    text-blue-400
  `,

default: `     border-border
    bg-surface
    text-foreground-secondary
  `,
};

export default function CardBadge({
children,
variant = "default",
className = "",
}: CardBadgeProps) {
return (
<span
className={`         inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${variants[variant]}
        ${className}
      `}
>
{children} </span>
);
}

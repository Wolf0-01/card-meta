import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "neutral"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps {
children: ReactNode;

variant?: BadgeVariant;

className?: string;
}

const variantClasses: Record<
BadgeVariant,
string

> = {
default: `     border-zinc-700
    bg-zinc-800
     text-zinc-200
   `,

secondary: `     border-zinc-600
    bg-zinc-700
    text-zinc-300
  `,

neutral: `     border-slate-700
    bg-slate-900
    text-slate-300
  `,

success: `     border-emerald-800
    bg-emerald-950
    text-emerald-300
  `,

warning: `     border-amber-800
    bg-amber-950
    text-amber-300
  `,

danger: `     border-red-800
    bg-red-950
    text-red-300
  `,
};


export default function Badge({
children,

variant = "default",

className = "",
}: BadgeProps) {
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
        ${variantClasses[variant]}
        ${className}
      `}
>
{children} </span>
);
}

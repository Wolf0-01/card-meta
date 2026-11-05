import type { ReactNode } from "react";

export type StatCardVariant =
| "primary"
| "secondary"
| "success"
| "warning"
| "danger"
| "neutral";

interface StatCardProps {
title?: string;

label?: string;

value: ReactNode;

subtitle?: ReactNode;

icon?: ReactNode;

variant?: StatCardVariant;

className?: string;
}


const variantClasses: Record<
StatCardVariant,
string

> = {
primary: `     border-blue-800
     bg-blue-950/30
     hover:border-blue-500
   `,

secondary: `     border-violet-800
    bg-violet-950/30
    hover:border-violet-500
  `,

success: `     border-emerald-800
    bg-emerald-950/30
    hover:border-emerald-500
  `,

warning: `     border-amber-800
    bg-amber-950/30
    hover:border-amber-500
  `,

danger: `     border-red-800
    bg-red-950/30
    hover:border-red-500
  `,

neutral: `     border-zinc-800
    bg-zinc-950
    hover:border-zinc-600
  `,
};

export default function StatCard({
title,

label,

value,

subtitle,

icon,

variant = "neutral",

className = "",
}: StatCardProps) {
const displayLabel =
label ??
title ??
"";

return (
<div
className={`         rounded-xl
        border
        p-4
        text-center
        transition-all
        duration-200
        hover:shadow-lg
        ${variantClasses[variant]}
        ${className}
      `}
>
{icon && ( <div className="mb-2 flex justify-center">
{icon} </div>
)}


  {displayLabel && (
    <p
      className="
        text-xs
        font-semibold
        uppercase
        tracking-wider
        text-zinc-500
      "
    >
      {displayLabel}
    </p>
  )}

  <p
    className="
      mt-2
      text-2xl
      font-black
      text-white
    "
  >
    {value}
  </p>

  {subtitle && (
    <p
      className="
        mt-2
        text-xs
        text-zinc-500
      "
    >
      {subtitle}
    </p>
  )}
</div>


);
}

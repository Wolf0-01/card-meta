import { ReactNode } from "react";

type GridCols = 1 | 2 | 3 | 4 | 5 | 6;

interface GridProps {
  children: ReactNode;
  cols?: GridCols;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const colsVariants: Record<GridCols, string> = {
  1: "grid-cols-1",

  2: `
    grid-cols-1
    md:grid-cols-2
  `,

  3: `
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-3
  `,

  4: `
    grid-cols-1
    sm:grid-cols-2
    xl:grid-cols-4
  `,

  5: `
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-5
  `,

  6: `
    grid-cols-2
    md:grid-cols-3
    xl:grid-cols-6
  `,
};

const gapVariants = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export default function Grid({
  children,
  cols = 4,
  gap = "md",
  className = "",
}: GridProps) {
  return (
    <div
      className={`
        grid
        ${colsVariants[cols]}
        ${gapVariants[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
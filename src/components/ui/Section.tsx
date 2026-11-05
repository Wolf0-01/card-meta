import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingVariants = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Section({
  children,
  className = "",
  padding = "lg",
}: SectionProps) {
  return (
    <section
      className={`
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        shadow-xl
        ${paddingVariants[padding]}
        ${className}
      `}
    >
      {children}
    </section>
  );
}
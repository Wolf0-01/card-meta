import { ReactNode } from "react";

type CardVariant =
  | "default"
  | "primary"
  | "danger"
  | "success"
  | "warning";

interface CardProps {
  children: ReactNode;

  className?: string;

  variant?: CardVariant;

  hover?: boolean;
}

const variants: Record<
  CardVariant,
  string
> = {
  default: `
    hover:border-primary
    hover:shadow-primary/10
  `,

  primary: `
    hover:border-primary
    hover:shadow-primary/20
  `,

  danger: `
    hover:border-red-500
    hover:shadow-red-500/20
  `,

  success: `
    hover:border-green-500
    hover:shadow-green-500/20
  `,

  warning: `
    hover:border-yellow-500
    hover:shadow-yellow-500/20
  `,
};

export default function Card({
  children,
  className = "",
  variant = "default",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        group
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-surface
        shadow-sm
        transition-all
        duration-300

        ${
          hover
            ? `
              hover:-translate-y-1
              hover:shadow-xl
              ${variants[variant]}
            `
            : ""
        }

        ${className}
      `}
    >
      {children}
    </div>
  );
}
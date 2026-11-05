import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover",

    secondary:
      "bg-surface text-foreground border border-border hover:border-primary",

    outline:
      "border border-primary text-primary bg-transparent hover:bg-primary/10",

    ghost:
      "text-foreground hover:bg-surface",

    danger:
      "bg-red-600 text-white hover:bg-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `
    inline-flex
    items-center
    justify-center
    rounded-lg
    font-medium
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-primary/30
    disabled:opacity-50
    disabled:pointer-events-none
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
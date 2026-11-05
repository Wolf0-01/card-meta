import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export default function Container({
  children,
  size = "lg",
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`
        mx-auto
        w-full
        px-6
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
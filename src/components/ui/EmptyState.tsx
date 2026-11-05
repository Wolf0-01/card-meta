import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        px-6
        py-10
        text-center
        ${className}
      `}
    >
      {icon && (
        <div
          className="
            mb-4
            flex
            justify-center
            text-5xl
          "
        >
          {icon}
        </div>
      )}

      <h3
        className="
          text-lg
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      {description && (
        <p
          className="
            mt-2
            text-sm
            text-zinc-400
          "
        >
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
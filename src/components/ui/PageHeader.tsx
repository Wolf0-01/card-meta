import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`
        mb-8
        flex
        flex-col
        gap-4
        md:flex-row
        md:items-center
        md:justify-between
        ${className}
      `}
    >
      <div>
        <h1
          className="
            text-4xl
            font-black
            tracking-wide
            text-white
          "
        >
          {title}
        </h1>

        {description && (
          <p
            className="
              mt-2
              max-w-3xl
              text-zinc-400
            "
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {actions}
        </div>
      )}
    </header>
  );
}
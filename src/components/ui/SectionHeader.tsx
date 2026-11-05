import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">

      <div>

        <h2
          className="
            text-2xl
            font-bold
            tracking-tight
            text-foreground
            lg:text-3xl
          "
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="
              mt-2
              text-sm
              text-foreground-secondary
            "
          >
            {subtitle}
          </p>
        )}

      </div>

      {action}

    </div>
  );
}
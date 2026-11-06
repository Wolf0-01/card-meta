import Link from "next/link";

import type {
  ReactNode,
} from "react";

interface AuthCardProps {
  title: string;

  subtitle: string;

  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-background
        px-4
        py-12
        text-foreground
      "
    >
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="
            mb-8
            block
            text-center
            text-sm
            font-semibold
            text-foreground-muted
            transition-colors
            hover:text-primary
          "
        >
          ← Volver a Card Meta
        </Link>

        <div
          className="
            rounded-2xl
            border
            border-border
            bg-background-secondary
            p-8
            shadow-[var(--shadow-card)]
          "
        >
          <header className="mb-8 text-center">
            <h1
              className="
                text-2xl
                font-black
                text-foreground
              "
            >
              {title}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-foreground-muted
              "
            >
              {subtitle}
            </p>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}

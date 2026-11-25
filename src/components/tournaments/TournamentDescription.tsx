import type { ReactNode } from "react";

interface TournamentDescriptionProps {
  text: string;
}

const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function renderInlineLinks(content: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(LINK_REGEX)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index));
    }

    const label = match[1];
    const url = match[2];

    parts.push(
      <a
        key={`${url}-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-sky-400 underline-offset-2 transition-colors hover:text-sky-300 hover:underline"
      >
        {label}
      </a>
    );

    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

export default function TournamentDescription({
  text,
}: TournamentDescriptionProps) {
  const lines = text.split(/\r?\n/);

  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed text-slate-300">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={index} className="h-2" />;
        }

        const isBullet =
          line.startsWith("•") ||
          line.startsWith("-") ||
          line.startsWith("*");

        if (isBullet) {
          const cleanBullet = line.replace(/^[•\-*]\s*/, "");

          return (
            <div
              key={index}
              className="flex items-start gap-2.5 pl-1"
            >
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"
              />
              <span>{renderInlineLinks(cleanBullet)}</span>
            </div>
          );
        }

        // Líneas sin viñeta ni dos puntos al final se tratan como subtítulos de sección
        const isHeading =
          !line.includes(":") &&
          !line.startsWith("[") &&
          line.length <= 45;

        if (isHeading) {
          return (
            <h3
              key={index}
              className="pt-2 text-lg font-extrabold tracking-tight text-white first:pt-0 sm:text-xl"
            >
              {line}
            </h3>
          );
        }

        return (
          <p key={index}>
            {renderInlineLinks(line)}
          </p>
        );
      })}
    </div>
  );
}

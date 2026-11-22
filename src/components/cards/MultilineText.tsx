import { Fragment } from "react";

import { splitMultilineText } from "@/lib/multiline";

interface MultilineTextProps {
  text: string;

  className?: string;
}

/**
 * Renderiza cada salto de línea como un `<br />` real.
 * Evita que párrafos y viñetas importadas se muestren
 * concatenados en una sola línea.
 */
export default function MultilineText({
  text,
  className,
}: MultilineTextProps) {
  const lines = splitMultilineText(text);

  return (
    <span className={className}>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </span>
  );
}

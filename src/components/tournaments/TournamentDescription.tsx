import type { ReactNode } from "react";

interface TournamentDescriptionProps {
  text: string;
}

const TOKEN_REGEX = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*)/g;

function renderInlineFormatting(content: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(TOKEN_REGEX)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index));
    }

    if (match[2] && match[3]) {
      parts.push(
        <a
          key={`link-${index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sky-400 underline-offset-2 transition-colors hover:text-sky-300 hover:underline"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      parts.push(
        <strong key={`bold-${index}`} className="font-bold text-white">
          {match[4]}
        </strong>
      );
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s:-]+\|[\s|:-]+\|?$/.test(line.trim());
}

export default function TournamentDescription({
  text,
}: TournamentDescriptionProps) {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      blocks.push(<div key={`space-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Bloques de tabla Markdown (| A | B |)
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const dataRows = tableLines.filter((row) => !isTableSeparator(row));
      if (dataRows.length > 0) {
        const headers = parseTableCells(dataRows[0]);
        const rows = dataRows.slice(1).map(parseTableCells);

        blocks.push(
          <div
            key={`table-${i}`}
            className="my-2.5 overflow-x-auto rounded-lg border border-slate-700/60 bg-[#070D1F]/70"
          >
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/80 text-[11px] font-black uppercase tracking-wider text-slate-200">
                  {headers.map((header, hIdx) => (
                    <th key={hIdx} className="px-3 py-2">
                      {renderInlineFormatting(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {rows.map((cells, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/30">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    const isBullet =
      line.startsWith("•") || line.startsWith("-") || line.startsWith("*");

    if (isBullet) {
      const cleanBullet = line.replace(/^[•\-*]\s*/, "");
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 pl-1">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"
          />
          <span>{renderInlineFormatting(cleanBullet)}</span>
        </div>
      );
      i++;
      continue;
    }

    const isMarkdownHeading = /^#{1,3}\s+/.test(line);
    const isPlainHeading =
      !line.includes(":") &&
      !line.startsWith("[") &&
      !line.startsWith("|") &&
      line.length <= 45;

    if (isMarkdownHeading || isPlainHeading) {
      const cleanHeading = line.replace(/^#{1,3}\s+/, "");
      blocks.push(
        <h3
          key={`heading-${i}`}
          className="pt-2 text-lg font-extrabold tracking-tight text-white first:pt-0 sm:text-xl"
        >
          {cleanHeading}
        </h3>
      );
      i++;
      continue;
    }

    blocks.push(
      <p key={`p-${i}`}>{renderInlineFormatting(line)}</p>
    );
    i++;
  }

  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed text-slate-300">
      {blocks}
    </div>
  );
}

import { Fragment, type ReactNode } from "react";

import { splitMultilineText } from "@/lib/multiline";

interface MultilineTextProps {
  text: string;

  className?: string;
}

interface TextBlock {
  kind: "text";
  line: string;
  key: number;
}

interface HeadingBlock {
  kind: "heading";
  line: string;
  key: number;
}

interface TableBlock {
  kind: "table";
  rows: string[][];
  key: number;
}

type ContentBlock = TextBlock | HeadingBlock | TableBlock;

/** Celda separadora de una tabla Markdown: `---`, `:---` o `---:`. */
const TABLE_SEPARATOR = /^:?-{3,}:?$/;

function isTableLine(line: string): boolean {
  const trimmed = line.trim();

  return (
    trimmed.length > 1 &&
    trimmed.startsWith("|") &&
    trimmed.endsWith("|")
  );
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return (
    cells.length > 0 &&
    cells.every((cell) =>
      TABLE_SEPARATOR.test(cell)
    )
  );
}

/**
 * Agrupa las líneas en párrafos, subtítulos (`## `) y
 * tablas (`| Col | Col |`). Las filas separadoras
 * (`| --- |`) se descartan.
 */
function buildBlocks(
  lines: string[]
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (isTableLine(line)) {
      const rows: string[][] = [];

      const key = index;

      while (
        index < lines.length &&
        isTableLine(lines[index] ?? "")
      ) {
        const cells = parseTableRow(
          lines[index] ?? ""
        );

        if (!isSeparatorRow(cells)) {
          rows.push(cells);
        }

        index += 1;
      }

      blocks.push({ kind: "table", rows, key });

      continue;
    }

    if (line.trimStart().startsWith("## ")) {
      blocks.push({
        kind: "heading",
        line: line.trimStart().slice(3),
        key: index,
      });

      index += 1;

      continue;
    }

    blocks.push({ kind: "text", line, key: index });

    index += 1;
  }

  return blocks;
}

/** Convierte `**texto**` en negrita y deja el resto igual. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (
      part.length > 4 &&
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="font-bold text-slate-100"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function ContentTable({
  rows,
}: {
  rows: string[][];
}) {
  const [header, ...body] = rows;

  if (!header) {
    return null;
  }

  return (
    <span
      role="table"
      className="
        my-3
        block
        w-full
        overflow-x-auto
        rounded-lg
        border
        border-slate-700/70
        bg-[#070D1F]
      "
    >
      <span
        role="rowgroup"
        className="
          table
          w-full
          border-collapse
          text-[11.5px]
          leading-5
        "
      >
        <span
          role="row"
          className="table-row bg-slate-800/70"
        >
          {header.map((cell, index) => (
            <span
              key={index}
              role="columnheader"
              className="
                table-cell
                border-b
                border-slate-700/70
                px-2.5
                py-1.5
                text-left
                text-[10px]
                font-black
                uppercase
                tracking-[0.08em]
                text-slate-200
              "
            >
              {renderInline(cell)}
            </span>
          ))}
        </span>

        {body.map((row, rowIndex) => (
          <span
            key={rowIndex}
            role="row"
            className="
              table-row
              odd:bg-slate-900/40
            "
          >
            {row.map((cell, cellIndex) => (
              <span
                key={cellIndex}
                role="cell"
                className="
                  table-cell
                  border-b
                  border-slate-800/70
                  px-2.5
                  py-1.5
                  align-top
                  text-slate-300
                "
              >
                {renderInline(cell)}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Renderiza texto editorial multilínea:
 *
 * - Cada salto de línea como un `<br />` real.
 * - Líneas que empiezan con `## ` como subtítulos.
 * - Textos entre `**...**` en negrita.
 * - Bloques `| Col | Col |` como tablas oscuras.
 */
export default function MultilineText({
  text,
  className,
}: MultilineTextProps) {
  const blocks = buildBlocks(
    splitMultilineText(text)
  );

  return (
    <span className={className}>
      {blocks.map((block, index) => {
        if (block.kind === "table") {
          return (
            <ContentTable
              key={block.key}
              rows={block.rows}
            />
          );
        }

        if (block.kind === "heading") {
          return (
            <span
              key={block.key}
              className="
                mt-3
                mb-1
                block
                text-[12px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-100
              "
            >
              {renderInline(block.line)}
            </span>
          );
        }

        const previous = blocks[index - 1];

        const needsBreak =
          previous?.kind === "text";

        return (
          <Fragment key={block.key}>
            {needsBreak && <br />}
            {renderInline(block.line)}
          </Fragment>
        );
      })}
    </span>
  );
}

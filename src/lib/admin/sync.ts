import { spawn } from "node:child_process";

import path from "node:path";

export type AdminSyncTask = "sets" | "cards";

interface SyncStep {
  label: string;

  script: string;

  args: string[];
}

interface StepResult extends SyncStep {
  code: number;

  output: string;

  timedOut: boolean;
}

export interface AdminSyncResult {
  task: AdminSyncTask;

  ok: boolean;

  durationMs: number;

  summary: string;

  output: string;
}

const TSX_CLI = path.join(
  process.cwd(),
  "node_modules",
  "tsx",
  "dist",
  "cli.mjs"
);

const MAX_OUTPUT_LENGTH = 60_000;

const SCRIPT_TIMEOUT_MS = 20 * 60 * 1000;

/*
 * Los scripts son los mismos que se ejecutan por CLI.
 * `syncSetMeta` respeta los banners marcados con #manual.
 */
const TASKS: Record<AdminSyncTask, SyncStep[]> = {
  sets: [
    {
      label: "Sets y banners (Speed + Rush)",

      script: "scripts/syncSetMeta.ts",

      args: ["--apply"],
    },
  ],

  cards: [
    {
      label: "Cartas Speed nuevas",

      script: "scripts/importCards.ts",

      args: [],
    },
    {
      label: "Cartas Rush nuevas",

      script: "scripts/syncRushCards.ts",

      args: ["--apply"],
    },
    {
      label: "Fuentes obtain Speed",

      script: "scripts/updateObtain.ts",

      args: ["--apply"],
    },
    {
      label: "Fuentes obtain Rush",

      script: "scripts/updateObtain.ts",

      args: ["--rush", "--apply"],
    },
  ],
};

export function isAdminSyncTask(
  value: unknown
): value is AdminSyncTask {
  return value === "sets" || value === "cards";
}

function appendOutput(
  current: string,
  chunk: Buffer
) {
  const next = current + chunk.toString();

  return next.length > MAX_OUTPUT_LENGTH
    ? next.slice(-MAX_OUTPUT_LENGTH)
    : next;
}

function runStep(
  step: SyncStep
): Promise<StepResult> {
  return new Promise((resolve) => {
    let output = "";

    let timedOut = false;

    const child = spawn(
      process.execPath,
      [
        TSX_CLI,
        step.script,
        ...step.args,
      ],
      {
        cwd: process.cwd(),

        env: {
          ...process.env,

          FORCE_COLOR: "0",
        },

        windowsHide: true,
      }
    );

    const timer = setTimeout(() => {
      timedOut = true;

      child.kill("SIGTERM");
    }, SCRIPT_TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      output = appendOutput(output, chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      output = appendOutput(output, chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timer);

      output = appendOutput(
        output,
        Buffer.from(
          `\n${error.message}\n`
        )
      );

      resolve({
        ...step,

        code: 1,

        output,

        timedOut,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);

      resolve({
        ...step,

        code: code ?? 1,

        output,

        timedOut,
      });
    });
  });
}

function summarize(output: string) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const interesting = lines.filter((line) =>
    /(✅|⚠|❌|resumen|nuevas:|actualizadas:|insertadas:|sin cambios:|banners manuales|setmeta sincronizado|cartas rush|obtención|importación terminada|error)/i.test(
      line
    )
  );

  return (
    interesting.length > 0
      ? interesting
      : lines
  )
    .slice(-30)
    .join("\n");
}

export async function runAdminSync(
  task: AdminSyncTask
): Promise<AdminSyncResult> {
  const startedAt = Date.now();

  const results: StepResult[] = [];

  let ok = true;

  for (const step of TASKS[task]) {
    const result = await runStep(step);

    results.push(result);

    if (result.code !== 0) {
      ok = false;

      break;
    }
  }

  const output = results
    .map(
      (result) =>
        `\n=== ${result.label} (${result.script}) ===\n${result.output}`
    )
    .join("\n");

  return {
    task,

    ok,

    durationMs: Date.now() - startedAt,

    summary: summarize(output),

    output,
  };
}

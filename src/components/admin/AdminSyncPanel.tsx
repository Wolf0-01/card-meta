"use client";

import { useState } from "react";

import {
  Ban,
  CheckCircle2,
  Database,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

type AdminSyncTask = "sets" | "cards" | "banlist";

const TASK_LABELS: Record<AdminSyncTask, string> = {
  sets: "Sets and banners",

  cards: "Cards and acquisition",

  banlist: "Banlist status",
};

interface AdminSyncResult {
  task: AdminSyncTask;

  ok: boolean;

  durationMs: number;

  summary: string;

  output: string;
}

interface SyncErrorResponse {
  error?: string;
}

function formatDuration(milliseconds: number) {
  const seconds = Math.round(
    milliseconds / 1000
  );

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  const remaining = seconds % 60;

  return `${minutes}m ${remaining}s`;
}

export default function AdminSyncPanel() {
  const [runningTask, setRunningTask] =
    useState<AdminSyncTask | null>(null);

  const [result, setResult] =
    useState<AdminSyncResult | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  async function runTask(task: AdminSyncTask) {
    if (runningTask) {
      return;
    }

    setRunningTask(task);

    setResult(null);

    setError(null);

    try {
      const response = await fetch(
        "/api/admin/sync",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({ task }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | AdminSyncResult
        | SyncErrorResponse
        | null;

      if (!response.ok) {
        throw new Error(
          data &&
            "error" in data &&
            data.error
            ? data.error
            : "Could not run the sync."
        );
      }

      setResult(data as AdminSyncResult);
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Could not run the sync."
      );
    } finally {
      setRunningTask(null);
    }
  }

  const isRunning = runningTask !== null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <section
          className="
            rounded-xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-4
            ring-1
            ring-inset
            ring-white/5
          "
        >
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-sky-500/30
                bg-sky-500/10
                text-sky-300
              "
            >
              <RefreshCw className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-slate-200
                "
              >
                Sets and banners
              </h2>

              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Sync SetMeta for Speed and Rush.
                Respects banners marked with{" "}
                <code className="text-amber-200">
                  #manual
                </code>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void runTask("sets");
            }}
            disabled={isRunning}
            className="
              mt-3
              inline-flex
              h-8
              w-full
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-sky-500/40
              bg-sky-500/10
              px-3
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-sky-200
              transition-colors
              hover:border-sky-400
              hover:bg-sky-500/20
              hover:text-white
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            {runningTask === "sets" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}

            {runningTask === "sets"
              ? "Syncing..."
              : "Sync sets"}
          </button>
        </section>

        <section
          className="
            rounded-xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-4
            ring-1
            ring-inset
            ring-white/5
          "
        >
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-emerald-500/30
                bg-emerald-500/10
                text-emerald-300
              "
            >
              <Database className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-slate-200
                "
              >
                Cards and acquisition
              </h2>

              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Import new Speed cards, sync
                Rush and update the{" "}
                <code className="text-amber-200">
                  obtain
                </code>{" "}
                sources for both formats. It may take
                several minutes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void runTask("cards");
            }}
            disabled={isRunning}
            className="
              mt-3
              inline-flex
              h-8
              w-full
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-emerald-500/40
              bg-emerald-500/10
              px-3
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-emerald-200
              transition-colors
              hover:border-emerald-400
              hover:bg-emerald-500/20
              hover:text-white
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            {runningTask === "cards" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Database className="h-3.5 w-3.5" />
            )}

            {runningTask === "cards"
              ? "Syncing..."
              : "Sync cards"}
          </button>
        </section>

        <section
          className="
            rounded-xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-4
            ring-1
            ring-inset
            ring-white/5
          "
        >
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-rose-500/30
                bg-rose-500/10
                text-rose-300
              "
            >
              <Ban className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-slate-200
                "
              >
                Banlist status
              </h2>

              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Sync Forbidden and Limited 1, 2
                and 3 cards from Duel Links Meta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void runTask("banlist");
            }}
            disabled={isRunning}
            className="
              mt-3
              inline-flex
              h-8
              w-full
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-rose-500/40
              bg-rose-500/10
              px-3
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-rose-200
              transition-colors
              hover:border-rose-400
              hover:bg-rose-500/20
              hover:text-white
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            {runningTask === "banlist" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Ban className="h-3.5 w-3.5" />
            )}

            {runningTask === "banlist"
              ? "Syncing..."
              : "Sync banlist"}
          </button>
        </section>
      </div>

      {isRunning && (
        <p
          role="status"
          className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-slate-700/60
            bg-[#0B132B]
            px-3
            py-2.5
            text-[10px]
            text-slate-400
          "
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-300" />
          Running the task on the server. Do not close
          this tab until it finishes.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-red-500/40
            bg-red-500/10
            px-3
            py-2.5
            text-[11px]
            leading-relaxed
            text-red-200
          "
        >
          {error}
        </div>
      )}

      {result && (
        <section
          className="
            rounded-xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-4
            ring-1
            ring-inset
            ring-white/5
          "
        >
          <div className="flex flex-wrap items-center gap-2">
            {result.ok ? (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-emerald-400/30
                  bg-emerald-400/10
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-emerald-200
                "
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
                Completed
              </span>
            ) : (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-amber-400/30
                  bg-amber-400/10
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-amber-200
                "
              >
                <TriangleAlert className="h-2.5 w-2.5" />
                Finished with errors
              </span>
            )}

            <span
              className="
                rounded
                border
                border-slate-700/70
                bg-[#070D1F]
                px-1.5
                py-0.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              {TASK_LABELS[result.task]}
            </span>

            <span
              className="
                ml-auto
                text-[9px]
                font-black
                tabular-nums
                text-slate-500
              "
            >
              {formatDuration(result.durationMs)}
            </span>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-3">
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Summary
            </p>

            <pre
              className="
                mt-1.5
                max-h-80
                overflow-auto
                whitespace-pre-wrap
                rounded-lg
                border
                border-slate-800
                bg-[#070D1F]
                p-2.5
                text-[10px]
                leading-relaxed
                text-slate-300
              "
            >
              {result.summary}
            </pre>
          </div>

          <details className="mt-3 border-t border-slate-800 pt-3">
            <summary
              className="
                cursor-pointer
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
                transition-colors
                hover:text-slate-200
              "
            >
              Full output
            </summary>

            <pre
              className="
                mt-1.5
                max-h-96
                overflow-auto
                whitespace-pre-wrap
                rounded-lg
                border
                border-slate-800
                bg-[#070D1F]
                p-2.5
                text-[10px]
                leading-relaxed
                text-slate-400
              "
            >
              {result.output}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}

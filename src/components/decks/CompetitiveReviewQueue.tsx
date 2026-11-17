"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  Check,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import {
  getAchievementShortLabel,
  normalizeAchievement,
  normalizePlacement,
} from "@/lib/decks/achievements";

export interface ReviewQueueItem {
  id: string;

  name: string;

  slug: string;

  identifier: string;

  achievement: string;

  placement: string | null;

  notes: string | null;

  proofUrl: string | null;

  author: {
    username: string;
    displayName: string | null;
  } | null;
}

interface CompetitiveReviewQueueProps {
  results: ReviewQueueItem[];
}

interface VerifyResponse {
  error?: string;

  deck?: {
    id?: string;

    verified?: boolean;
  };
}

/**
 * Cola de revisión visible solo para ADMIN/EDITOR.
 * Aprueba la captura y activa la insignia oficial.
 */
export default function CompetitiveReviewQueue({
  results,
}: CompetitiveReviewQueueProps) {
  const router = useRouter();

  const [items, setItems] =
    useState<ReviewQueueItem[]>(results);

  const [busyId, setBusyId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function approve(item: ReviewQueueItem) {
    if (busyId) {
      return;
    }

    setBusyId(item.id);

    setError(null);

    try {
      const response = await fetch(
        `/api/decks/${item.id}/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            verified: true,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | VerifyResponse
        | null;

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Could not approve the result."
        );
      }

      setItems((current) =>
        current.filter(
          (entry) => entry.id !== item.id
        )
      );

      router.refresh();
    } catch (approveError) {
      setError(
        approveError instanceof Error
          ? approveError.message
          : "Could not approve the result."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Pending competitive results"
      className="space-y-2"
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          border-b
          border-amber-500/25
          pb-2
        "
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />

          <h2
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.2em]
              text-amber-200
            "
          >
            Review queue
          </h2>
        </div>

        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <span className="tabular-nums text-amber-200">
            {items.length}
          </span>{" "}
          pending
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="
            rounded-lg
            border
            border-red-500/40
            bg-red-500/10
            px-3
            py-2
            text-[11px]
            text-red-200
          "
        >
          {error}
        </p>
      )}

      <ul className="space-y-1.5">
        {items.map((item) => {
          const achievement =
            normalizeAchievement(item.achievement);

          const placement =
            normalizePlacement(item.placement);

          const player =
            item.author?.displayName ??
            item.author?.username ??
            "Unknown player";

          return (
            <li
              key={item.id}
              className="
                flex
                flex-col
                gap-2
                rounded-lg
                border
                border-slate-800
                bg-[#0B132B]/60
                px-3
                py-2.5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="
                      rounded-md
                      border
                      border-amber-400/30
                      bg-amber-400/10
                      px-1.5
                      py-0.5
                      text-[9px]
                      font-black
                      uppercase
                      tracking-wide
                      text-amber-200
                    "
                  >
                    {getAchievementShortLabel(
                      achievement
                    )}
                  </span>

                  {placement && (
                    <span
                      className="
                        rounded-md
                        border
                        border-violet-400/30
                        bg-violet-400/10
                        px-1.5
                        py-0.5
                        text-[9px]
                        font-black
                        uppercase
                        tracking-wide
                        text-violet-200
                      "
                    >
                      {placement}
                    </span>
                  )}

                  <Link
                    href={`/decks/${item.slug}/${item.identifier}`}
                    className="truncate text-[11px] font-bold text-blue-300 hover:text-blue-200 hover:underline"
                  >
                    {item.name}
                  </Link>
                </div>

                <p className="truncate text-[10px] text-slate-400">
                  by{" "}
                  {item.author?.username ? (
                    <Link
                      href={`/user/${item.author.username}`}
                      className="font-semibold text-slate-300 hover:text-blue-200"
                    >
                      {player}
                    </Link>
                  ) : (
                    player
                  )}

                  {item.notes
                    ? ` · ${item.notes}`
                    : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {item.proofUrl && (
                  <a
                    href={item.proofUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-800/60
                      px-2
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-slate-300
                      transition-colors
                      hover:border-blue-400/40
                      hover:text-blue-200
                    "
                  >
                    <ExternalLink className="h-3 w-3" />
                    Proof
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => approve(item)}
                  disabled={busyId === item.id}
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-lg
                    border
                    border-emerald-500/40
                    bg-emerald-500/10
                    px-2
                    py-1.5
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wide
                    text-emerald-300
                    transition-colors
                    hover:bg-emerald-500/20
                    disabled:cursor-wait
                    disabled:opacity-60
                  "
                >
                  <Check className="h-3 w-3" />
                  {busyId === item.id
                    ? "Approving..."
                    : "Approve Result"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

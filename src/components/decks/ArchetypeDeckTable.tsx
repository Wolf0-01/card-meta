"use client";

import { useRouter } from "next/navigation";

import Image from "next/image";

import Link from "next/link";

import {
  ClipboardList,
  Clock,
  Trophy,
  X,
} from "lucide-react";

import {
  getAchievementEmblem,
  type DeckAchievement,
  type DeckPlacement,
} from "@/lib/decks/achievements";

import { formatDate } from "@/lib/format";

import { useArchetypeCardFilter } from "./ArchetypeCardFilterContext";

export interface ArchetypeDeckRow {
  id: string;

  href: string;

  skill: string | null;

  notes: string | null;

  achievement: DeckAchievement;

  placement: DeckPlacement | null;

  verified: boolean;

  playerUsername: string | null;

  playerName: string | null;

  /** Cartas del mazo, usadas para filtrar por Core Card. */
  cardIds: number[];

  createdAt: string;
}

interface ArchetypeDeckTableProps {
  rows: ArchetypeDeckRow[];

  /**
   * Solo ADMIN y EDITOR pueden filtrar por Core Card.
   */
  canFilter?: boolean;

  /**
   * Solo ADMIN y EDITOR pueden abrir el perfil público
   * del jugador desde la tabla.
   */
  canViewPlayerProfile?: boolean;
}

const TONE_CLASSES = {
  gold: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  blue: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  violet:
    "border-violet-400/40 bg-violet-400/10 text-violet-300",
} as const;

function TopEmblem({
  achievement,
  verified,
}: {
  achievement: DeckAchievement;
  verified: boolean;
}) {
  const emblem = getAchievementEmblem(achievement);

  if (!emblem) {
    return (
      <span className="text-slate-600">—</span>
    );
  }

  if (!verified) {
    return (
      <span
        title="Pending staff review"
        className="
          inline-flex
          items-center
          gap-1
          rounded-full
          border
          border-slate-600/60
          bg-slate-800/60
          px-1.5
          py-0.5
          text-[9px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        <Clock className="h-2.5 w-2.5" />
        Pending
      </span>
    );
  }

  const tone = TONE_CLASSES[emblem.tone];

  if (achievement === "KOG") {
    return (
      <Image
        src="/icons/kog-lion.png"
        alt={emblem.label}
        title={emblem.label}
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
      />
    );
  }

  if (achievement === "KC_MAX") {
    return (
      <Image
        src="/icons/kc-cup.png"
        alt={emblem.label}
        title={emblem.label}
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
      />
    );
  }

  return (
    <span
      title={emblem.label}
      aria-label={emblem.label}
      className={`
        inline-flex
        h-7
        w-7
        items-center
        justify-center
        rounded-full
        border
        ${tone}
      `}
    >
      <Trophy className="h-3.5 w-3.5" />
    </span>
  );
}

function NotesCell({
  notes,
}: {
  notes: string | null;
}) {
  if (!notes) {
    return (
      <span className="text-slate-600">—</span>
    );
  }

  return (
    <span
      tabIndex={0}
      title={notes}
      aria-label={`Notes: ${notes}`}
      className="
        group
        relative
        inline-flex
        cursor-help
        items-center
        justify-center
        rounded-md
        border
        border-slate-700
        bg-slate-800/60
        p-1
        text-slate-300
        outline-none
        transition-colors
        hover:border-blue-400/50
        hover:text-blue-200
        focus-visible:border-blue-400/60
        focus-visible:ring-2
        focus-visible:ring-blue-500/30
      "
    >
      <ClipboardList className="h-3.5 w-3.5" />

      <span
        role="tooltip"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-full
          z-40
          mt-2
          hidden
          w-56
          -translate-x-1/2
          rounded-lg
          border
          border-slate-700
          bg-[#0B132B]
          px-2.5
          py-2
          text-left
          text-[10px]
          font-medium
          leading-4
          text-slate-200
          shadow-xl
          group-hover:block
          group-focus-visible:block
        "
      >
        {notes}
      </span>
    </span>
  );
}

/**
 * Tabla compacta estilo Duel Links Meta para los mazos de
 * un arquetipo. Cada fila abre la ficha completa del mazo.
 *
 * Cuando una Core Card está seleccionada en el Breakdown,
 * solo se muestran las filas que incluyen esa carta.
 */
export default function ArchetypeDeckTable({
  rows,
  canFilter = false,
  canViewPlayerProfile = false,
}: ArchetypeDeckTableProps) {
  const router = useRouter();

  const filter = useArchetypeCardFilter();

  const selectedCardId = canFilter
    ? filter?.selected?.id ?? null
    : null;

  const visibleRows =
    selectedCardId === null
      ? rows
      : rows.filter((row) =>
          row.cardIds.includes(selectedCardId)
        );

  return (
    <div className="space-y-2">
      {canFilter && filter?.selected && (
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            rounded-xl
            border
            border-blue-400/30
            bg-blue-500/[0.08]
            px-3
            py-2
          "
        >
          <p className="min-w-0 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">
            Showing{" "}
            <span className="tabular-nums text-white">
              {visibleRows.length}
            </span>{" "}
            {visibleRows.length === 1
              ? "deck"
              : "decks"}{" "}
            with{" "}
            <span className="text-white">
              {filter.selected.name}
            </span>
          </p>

          <button
            type="button"
            onClick={filter.clear}
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-md
              border
              border-blue-400/30
              bg-blue-500/10
              px-2
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-wide
              text-blue-200
              transition-colors
              hover:bg-blue-500/20
              hover:text-white
            "
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        </div>
      )}

      <div
        className="
          overflow-x-auto
          rounded-xl
          border
          border-slate-800
          bg-[#0B132B]/60
          lg:overflow-visible
        "
      >
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr
              className="
                border-b
                border-slate-800
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-500
              "
            >
              <th scope="col" className="px-3 py-2.5">
                Skill
              </th>

              <th scope="col" className="px-2 py-2.5">
                Notes
              </th>

              <th scope="col" className="px-2 py-2.5">
                Top
              </th>

              <th scope="col" className="px-2 py-2.5">
                Place
              </th>

              <th scope="col" className="px-3 py-2.5">
                Player
              </th>

              <th scope="col" className="px-3 py-2.5 text-right">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-xs text-slate-400"
                >
                  No deck in this list includes{" "}
                  <span className="font-bold text-slate-200">
                    {filter?.selected?.name ?? "this card"}
                  </span>
                  .
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const playerLabel =
                  row.playerName ??
                  row.playerUsername ??
                  "Anonymous";

                return (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    aria-label={`Open ${playerLabel}'s deck`}
                    onClick={() => router.push(row.href)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();

                        router.push(row.href);
                      }
                    }}
                    className="
                      group
                      cursor-pointer
                      border-b
                      border-slate-800/60
                      outline-none
                      transition-colors
                      last:border-b-0
                      hover:bg-blue-500/[0.06]
                      focus-visible:bg-blue-500/[0.08]
                    "
                  >
                    <td className="max-w-[220px] px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="
                            h-2
                            w-2
                            shrink-0
                            rotate-45
                            rounded-[1px]
                            bg-amber-400
                            shadow-[0_0_8px_rgba(251,191,36,0.6)]
                          "
                        />

                        <span className="truncate text-[11px] font-semibold text-slate-200">
                          {row.skill?.trim() ||
                            "No skill"}
                        </span>
                      </span>
                    </td>

                    <td className="px-2 py-2.5">
                      <NotesCell notes={row.notes} />
                    </td>

                    <td className="px-2 py-2.5">
                      <TopEmblem
                        achievement={row.achievement}
                        verified={row.verified}
                      />
                    </td>

                    <td className="px-2 py-2.5">
                      {row.verified &&
                      (row.achievement ===
                        "TOURNAMENT" ||
                        row.achievement ===
                          "KC_MAX") &&
                      row.placement ? (
                        <span
                          className="
                            inline-flex
                            items-center
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
                          {row.placement}
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          —
                        </span>
                      )}
                    </td>

                    <td className="max-w-[160px] px-3 py-2.5">
                      {canViewPlayerProfile &&
                      row.playerUsername ? (
                        <Link
                          href={`/user/${row.playerUsername}`}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="
                            block
                            truncate
                            text-[11px]
                            font-semibold
                            text-blue-300
                            transition-colors
                            hover:text-blue-200
                            hover:underline
                          "
                        >
                          {playerLabel}
                        </Link>
                      ) : (
                        <span
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className={`
                            block
                            truncate
                            text-[11px]
                            font-semibold
                            ${
                              row.playerUsername
                                ? "text-slate-300"
                                : "text-slate-500"
                            }
                          `}
                        >
                          {playerLabel}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-[10px] font-semibold text-slate-400">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

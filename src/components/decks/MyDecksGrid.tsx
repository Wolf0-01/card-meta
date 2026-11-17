"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  Eye,
  Globe,
  Layers,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";

import CompetitiveResultForm, {
  EMPTY_COMPETITIVE_RESULT,
  toCompetitiveResultValue,
  type CompetitiveResultValue,
} from "@/components/decks/CompetitiveResultForm";

import {
  getAchievementShortLabel,
  normalizeAchievement,
} from "@/lib/decks/achievements";

import { DECK_RULES } from "@/lib/decks/rules";

import type {
  UserDeckSummary,
} from "@/lib/decks/service";

import DeleteDeckDialog from "./DeleteDeckDialog";

interface MyDecksGridProps {
  initialDecks: UserDeckSummary[];

  /** ADMIN/EDITOR pueden aprobar resultados pendientes. */
  isStaff?: boolean;
}

interface DeckMutationResponse {
  deck?: {
    id?: string;

    isPublic?: boolean;

    achievement?: string;

    placement?: string | null;

    notes?: string | null;

    proofUrl?: string | null;

    verified?: boolean;
  };

  error?: string;

  issues?: Array<{
    message?: string;
  }>;
}

type DeckFilter = "all" | "public" | "draft";

const ACTION_BASE = `
  inline-flex
  items-center
  justify-center
  gap-1.5
  rounded-lg
  border
  px-2
  py-1.5
  text-[11px]
  font-semibold
  transition-colors
  focus:outline-none
  focus:ring-2
`;

function formatDate(value: string) {
  const [year, month, day] =
    value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function getMutationError(
  data: DeckMutationResponse | null,
  fallback: string
) {
  const issues = Array.isArray(
    data?.issues
  )
    ? data.issues
        .map((issue) => issue.message)
        .filter(
          (
            message
          ): message is string =>
            Boolean(message)
        )
        .join(" ")
    : "";

  return [data?.error ?? fallback, issues]
    .filter(Boolean)
    .join(" ");
}

function Counter({
  label,
  value,
  max,
  highlight,
}: {
  label: string;

  value: number;

  max: number;

  highlight: "success" | "warning" | "neutral";
}) {
  const classes = {
    success:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",

    warning:
      "border-amber-500/25 bg-amber-500/10 text-amber-300",

    neutral:
      "border-border bg-surface text-foreground-muted",
  }[highlight];

  return (
    <div
      className={`
        rounded-lg
        border
        px-2
        py-1.5
        ${classes}
      `}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-80">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-black tabular-nums">
        {value}

        <span className="text-[9px] font-semibold opacity-70">
          /{max}
        </span>
      </p>
    </div>
  );
}

export default function MyDecksGrid({
  initialDecks,
  isStaff = false,
}: MyDecksGridProps) {
  const router = useRouter();

  const [decks, setDecks] =
    useState<UserDeckSummary[]>(
      initialDecks
    );

  const [filter, setFilter] =
    useState<DeckFilter>("all");

  const [
    visibilityBusyId,
    setVisibilityBusyId,
  ] = useState<string | null>(null);

  const [deckToDelete, setDeckToDelete] =
    useState<UserDeckSummary | null>(null);

  const [
    isDeletingDeck,
    setIsDeletingDeck,
  ] = useState(false);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const [
    resultEditorId,
    setResultEditorId,
  ] = useState<string | null>(null);

  const [resultDraft, setResultDraft] =
    useState<CompetitiveResultValue>(
      EMPTY_COMPETITIVE_RESULT
    );

  const [resultBusyId, setResultBusyId] =
    useState<string | null>(null);

  const [approveBusyId, setApproveBusyId] =
    useState<string | null>(null);

  const [resultNotice, setResultNotice] =
    useState<string | null>(null);

  function openResultEditor(
    deck: UserDeckSummary
  ) {
    setResultEditorId(deck.id);

    setResultDraft(
      toCompetitiveResultValue(deck)
    );

    setResultNotice(null);

    setError(null);
  }

  async function saveResult(
    deck: UserDeckSummary
  ) {
    if (resultBusyId) {
      return;
    }

    if (
      resultDraft.achievement ===
        "TOURNAMENT" &&
      !resultDraft.placement
    ) {
      setError(
        "Select the tournament placement."
      );

      return;
    }

    setResultBusyId(deck.id);

    setError(null);

    setResultNotice(null);

    try {
      const response = await fetch(
        `/api/decks/${deck.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            achievement:
              resultDraft.achievement,

            placement:
              resultDraft.achievement ===
              "TOURNAMENT"
                ? resultDraft.placement ||
                  null
                : null,

            notes:
              resultDraft.notes.trim() ||
              null,

            proofUrl:
              resultDraft.proofUrl.trim() ||
              null,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | DeckMutationResponse
        | null;

      if (!response.ok) {
        throw new Error(
          getMutationError(
            data,
            "Could not save the competitive result."
          )
        );
      }

      const updated = data?.deck;

      setDecks((current) =>
        current.map((item) =>
          item.id === deck.id
            ? {
                ...item,

                achievement:
                  updated?.achievement ??
                  resultDraft.achievement,

                placement:
                  updated?.placement ??
                  (resultDraft.achievement ===
                  "TOURNAMENT"
                    ? resultDraft.placement ||
                      null
                    : null),

                notes:
                  updated?.notes ??
                  (resultDraft.notes.trim() ||
                    null),

                proofUrl:
                  updated?.proofUrl ??
                  (resultDraft.proofUrl.trim() ||
                    null),

                verified:
                  updated?.verified ?? false,
              }
            : item
        )
      );

      setResultEditorId(null);

      setResultNotice(
        updated?.verified
          ? "Competitive result saved and verified."
          : "Competitive result submitted for review."
      );

      router.refresh();
    } catch (saveResultError) {
      setError(
        saveResultError instanceof Error
          ? saveResultError.message
          : "Could not save the competitive result."
      );
    } finally {
      setResultBusyId(null);
    }
  }

  async function approveResult(
    deck: UserDeckSummary
  ) {
    if (approveBusyId) {
      return;
    }

    setApproveBusyId(deck.id);

    setError(null);

    setResultNotice(null);

    try {
      const response = await fetch(
        `/api/decks/${deck.id}/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            verified: true,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | DeckMutationResponse
        | null;

      if (!response.ok) {
        throw new Error(
          getMutationError(
            data,
            "Could not approve the result."
          )
        );
      }

      setDecks((current) =>
        current.map((item) =>
          item.id === deck.id
            ? {
                ...item,
                verified:
                  data?.deck?.verified ?? true,
              }
            : item
        )
      );

      setResultNotice(
        `“${deck.name}” result approved.`
      );

      router.refresh();
    } catch (approveError) {
      setError(
        approveError instanceof Error
          ? approveError.message
          : "Could not approve the result."
      );
    } finally {
      setApproveBusyId(null);
    }
  }

  async function handleVisibilityToggle(
    deck: UserDeckSummary
  ) {
    if (visibilityBusyId === deck.id) {
      return;
    }

    const nextIsPublic = !deck.isPublic;

    if (
      nextIsPublic &&
      deck.counts.main <
        DECK_RULES.mainMin
    ) {
      setError(
        `“${deck.name}” needs at least ${DECK_RULES.mainMin} cards in the Main Deck to be published.`
      );

      return;
    }

    setError(null);

    setVisibilityBusyId(deck.id);

    setDecks((current) =>
      current.map((item) =>
        item.id === deck.id
          ? {
              ...item,
              isPublic: nextIsPublic,
            }
          : item
      )
    );

    try {
      const response = await fetch(
        `/api/decks/${deck.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            isPublic: nextIsPublic,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | DeckMutationResponse
        | null;

      if (!response.ok) {
        throw new Error(
          getMutationError(
            data,
            "Could not change the deck visibility."
          )
        );
      }

      setDecks((current) =>
        current.map((item) =>
          item.id === deck.id
            ? {
                ...item,

                isPublic:
                  data?.deck?.isPublic ??
                  nextIsPublic,
              }
            : item
        )
      );

      /*
       * Refresca el resumen del encabezado (mazos
       * públicos) sin perder el estado optimista.
       */
      router.refresh();
    } catch (visibilityError) {
      setDecks((current) =>
        current.map((item) =>
          item.id === deck.id
            ? {
                ...item,
                isPublic: deck.isPublic,
              }
            : item
        )
      );

      setError(
        visibilityError instanceof Error
          ? visibilityError.message
          : "Could not change the deck visibility."
      );
    } finally {
      setVisibilityBusyId(null);
    }
  }

  function openDeleteDialog(
    deck: UserDeckSummary
  ) {
    setDeleteError(null);

    setDeckToDelete(deck);
  }

  function closeDeleteDialog() {
    if (isDeletingDeck) {
      return;
    }

    setDeckToDelete(null);

    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deckToDelete || isDeletingDeck) {
      return;
    }

    const deck = deckToDelete;

    setIsDeletingDeck(true);

    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/decks/${deck.id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | DeckMutationResponse
        | null;

      if (!response.ok) {
        throw new Error(
          getMutationError(
            data,
            "Could not delete the deck."
          )
        );
      }

      setDecks((current) =>
        current.filter(
          (item) => item.id !== deck.id
        )
      );

      setDeckToDelete(null);

      router.refresh();
    } catch (deleteDeckError) {
      setDeleteError(
        deleteDeckError instanceof Error
          ? deleteDeckError.message
          : "Could not delete the deck."
      );
    } finally {
      setIsDeletingDeck(false);
    }
  }

  if (decks.length === 0) {
    return (
      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-dashed
          border-border
          bg-background-secondary
          px-6
          py-14
          text-center
        "
      >
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_55%)]
          "
        />

        <div className="relative">
          <span
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-primary/30
              bg-primary/10
              text-primary
            "
          >
            <Layers className="h-7 w-7" />
          </span>

          <h2 className="mt-4 text-lg font-black text-foreground">
            No decks yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">
            Create your first deck, save it as a
            draft and publish it when it is
            complete.
          </p>

          <div className="mt-6 flex justify-center">
            <Button href="/decks/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create my first deck
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const publicCount = decks.filter(
    (deck) => deck.isPublic
  ).length;

  const draftCount =
    decks.length - publicCount;

  const visibleDecks = decks.filter(
    (deck) =>
      filter === "all" ||
      (filter === "public"
        ? deck.isPublic
        : !deck.isPublic)
  );

  const filterTabs: Array<{
    key: DeckFilter;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "All",
      count: decks.length,
    },
    {
      key: "public",
      label: "Public",
      count: publicCount,
    },
    {
      key: "draft",
      label: "Drafts",
      count: draftCount,
    },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-red-500/40
            bg-red-500/10
            px-3
            py-2.5
            text-xs
            leading-5
            text-red-200
          "
        >
          <p className="min-w-0 flex-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss notice"
            className="
              shrink-0
              rounded-md
              p-0.5
              text-red-300/80
              transition-colors
              hover:bg-red-500/15
              hover:text-red-100
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {resultNotice && (
        <div
          role="status"
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-emerald-500/40
            bg-emerald-500/10
            px-3
            py-2.5
            text-xs
            leading-5
            text-emerald-200
          "
        >
          <p className="min-w-0 flex-1">
            {resultNotice}
          </p>

          <button
            type="button"
            onClick={() => setResultNotice(null)}
            aria-label="Dismiss notice"
            className="
              shrink-0
              rounded-md
              p-0.5
              text-emerald-300/80
              transition-colors
              hover:bg-emerald-500/15
              hover:text-emerald-100
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filter decks"
          className="flex flex-wrap items-center gap-1.5"
        >
          {filterTabs.map((tab) => {
            const active =
              filter === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilter(tab.key)
                }
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  transition-colors
                  ${
                    active
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border bg-surface text-foreground-muted hover:border-primary/30 hover:text-foreground"
                  }
                `}
              >
                {tab.label}

                <span
                  className={`
                    rounded-full
                    px-1.5
                    py-0.5
                    text-[9px]
                    font-black
                    tabular-nums
                    ${
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-background-secondary text-foreground-muted"
                    }
                  `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
          Sorted by last update
        </p>
      </div>

      {visibleDecks.length === 0 ? (
        <div
          className="
            rounded-xl
            border
            border-dashed
            border-border
            bg-background-secondary
            px-4
            py-10
            text-center
          "
        >
          <p className="text-sm font-bold text-foreground">
            No decks in this filter
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            {filter === "public"
              ? "Publish a deck to see it here."
              : "Create a draft in the builder to see it here."}
          </p>

          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            View all decks
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleDecks.map((deck) => {
            const isUpdating =
              visibilityBusyId === deck.id;

            const cannotPublish =
              !deck.isPublic &&
              deck.counts.main <
                DECK_RULES.mainMin;

            return (
              <article
                key={deck.id}
                className="
                  group
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-background-secondary
                  transition-all
                  duration-200
                  hover:border-primary/50
                  hover:shadow-lg
                  hover:shadow-primary/5
                "
              >
                <div className="space-y-2 p-3.5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className="
                          flex
                          items-center
                          gap-1.5
                          truncate
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.16em]
                          text-primary
                        "
                      >
                        <span
                          aria-hidden
                          className="
                            h-1.5
                            w-1.5
                            shrink-0
                            rotate-45
                            rounded-[1px]
                            bg-primary
                          "
                        />

                        <span className="truncate">
                          {deck.archetype?.name ??
                            "Personal deck"}
                        </span>
                      </p>

                      <h2 className="mt-1 line-clamp-2 text-base font-black leading-tight text-foreground">
                        {deck.name}
                      </h2>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={deck.isPublic}
                      aria-busy={isUpdating}
                      aria-label={
                        deck.isPublic
                          ? `${deck.name}: public. Switch to private.`
                          : `${deck.name}: private. Switch to public.`
                      }
                      title={
                        isUpdating
                          ? "Updating visibility..."
                          : deck.isPublic
                            ? "Make private"
                            : cannotPublish
                              ? `Needs ${DECK_RULES.mainMin} cards in the Main Deck to be published`
                              : "Make public"
                      }
                      onClick={() =>
                        handleVisibilityToggle(
                          deck
                        )
                      }
                      disabled={isUpdating}
                      className={`
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-2
                        py-1
                        text-[10px]
                        font-bold
                        transition-colors
                        disabled:cursor-wait
                        disabled:opacity-70
                        ${
                          deck.isPublic
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                            : "border-slate-600 bg-slate-800/80 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                        }
                      `}
                    >
                      {isUpdating ? (
                        <span
                          aria-hidden
                          className="
                            h-2.5
                            w-2.5
                            animate-spin
                            rounded-full
                            border
                            border-current
                            border-t-transparent
                          "
                        />
                      ) : (
                        <span
                          aria-hidden
                          className={`
                            relative
                            h-3.5
                            w-6
                            rounded-full
                            transition-colors
                            ${
                              deck.isPublic
                                ? "bg-emerald-500/80"
                                : "bg-slate-600"
                            }
                          `}
                        >
                          <span
                            className={`
                              absolute
                              top-0.5
                              h-2.5
                              w-2.5
                              rounded-full
                              bg-white
                              shadow
                              transition-transform
                              ${
                                deck.isPublic
                                  ? "translate-x-3"
                                  : "translate-x-0.5"
                              }
                            `}
                          />
                        </span>
                      )}

                      {deck.isPublic
                        ? "Public"
                        : "Private"}
                    </button>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      border-amber-500/20
                      bg-amber-500/5
                      px-2
                      py-1
                    "
                  >
                    <span
                      aria-hidden
                      className="
                        h-2
                        w-2
                        shrink-0
                        rotate-45
                        rounded-[2px]
                        bg-amber-400
                        shadow-[0_0_8px_rgba(251,191,36,0.6)]
                      "
                    />

                    <span
                      className="
                        shrink-0
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-foreground-muted
                      "
                    >
                      Skill
                    </span>

                    <span className="truncate text-[11px] font-semibold text-amber-200">
                      {deck.skill?.trim() ||
                        "No skill"}
                    </span>
                  </div>

                  {deck.achievement !== "NONE" && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1
                          rounded-md
                          border
                          px-1.5
                          py-0.5
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          ${
                            deck.verified
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          }
                        `}
                      >
                        <Trophy className="h-2.5 w-2.5" />

                        {getAchievementShortLabel(
                          normalizeAchievement(
                            deck.achievement
                          )
                        )}

                        {deck.placement
                          ? ` · ${deck.placement}`
                          : ""}

                        {deck.verified
                          ? " · Verified"
                          : " · Pending"}
                      </span>
                    </div>
                  )}

                  {deck.description && (
                    <p className="line-clamp-2 text-[11px] leading-4 text-foreground-muted">
                      {deck.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        resultEditorId ===
                        deck.id
                          ? setResultEditorId(null)
                          : openResultEditor(deck)
                      }
                      className={`
                        ${ACTION_BASE}
                        border-amber-500/30
                        bg-amber-500/5
                        text-amber-200
                        hover:bg-amber-500/15
                        focus:ring-amber-500/30
                      `}
                    >
                      <Trophy className="h-3.5 w-3.5" />

                      {resultEditorId === deck.id
                        ? "Hide result"
                        : "Competitive result"}
                    </button>

                    {isStaff &&
                      deck.achievement !==
                        "NONE" &&
                      !deck.verified && (
                        <button
                          type="button"
                          onClick={() =>
                            approveResult(deck)
                          }
                          disabled={
                            approveBusyId ===
                            deck.id
                          }
                          className={`
                            ${ACTION_BASE}
                            border-emerald-500/40
                            bg-emerald-500/10
                            text-emerald-300
                            hover:bg-emerald-500/20
                            focus:ring-emerald-500/30
                            disabled:cursor-wait
                            disabled:opacity-60
                          `}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />

                          {approveBusyId ===
                          deck.id
                            ? "Approving..."
                            : "Approve Result"}
                        </button>
                      )}
                  </div>

                  {resultEditorId === deck.id && (
                    <div className="space-y-2">
                      <CompetitiveResultForm
                        value={resultDraft}
                        onChange={setResultDraft}
                        isStaff={isStaff}
                        disabled={
                          resultBusyId === deck.id
                        }
                      />

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setResultEditorId(null)
                          }
                          className={`
                            ${ACTION_BASE}
                            border-border
                            bg-surface
                            text-foreground-muted
                            hover:text-foreground
                            focus:ring-primary/30
                          `}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            saveResult(deck)
                          }
                          disabled={
                            resultBusyId ===
                            deck.id
                          }
                          className={`
                            ${ACTION_BASE}
                            border-primary/40
                            bg-primary/10
                            text-primary
                            hover:bg-primary/20
                            focus:ring-primary/30
                            disabled:cursor-wait
                            disabled:opacity-60
                          `}
                        >
                          {resultBusyId ===
                          deck.id
                            ? "Saving..."
                            : "Save result"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-2.5 px-3.5 pb-3.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Counter
                      label="Main"
                      value={deck.counts.main}
                      max={DECK_RULES.mainMax}
                      highlight={
                        deck.counts.main >=
                        DECK_RULES.mainMin
                          ? "success"
                          : "warning"
                      }
                    />

                    <Counter
                      label="Extra"
                      value={deck.counts.extra}
                      max={DECK_RULES.extraMax}
                      highlight={
                        deck.counts.extra > 0
                          ? "success"
                          : "neutral"
                      }
                    />
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-2
                      border-t
                      border-border/70
                      pt-2.5
                    "
                  >
                    <p className="text-[10px] text-foreground-muted">
                      Updated on{" "}
                      {formatDate(deck.updatedAt)}
                    </p>

                    <span
                      className={`
                        inline-flex
                        shrink-0
                        items-center
                        gap-1
                        rounded-md
                        px-1.5
                        py-0.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wide
                        ${
                          deck.isPublic
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-700/40 text-slate-300"
                        }
                      `}
                    >
                      {deck.isPublic ? (
                        <Globe className="h-2.5 w-2.5" />
                      ) : (
                        <Lock className="h-2.5 w-2.5" />
                      )}

                      {deck.isPublic
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <div
                    className={`
                      grid
                      gap-1.5
                      ${
                        deck.isPublic
                          ? "grid-cols-3"
                          : "grid-cols-2"
                      }
                    `}
                  >
                    {deck.isPublic && (
                      <Link
                        href={`/decks/${deck.slug}/${deck.identifier}`}
                        className={`
                          ${ACTION_BASE}
                          border-primary/40
                          bg-primary/10
                          text-primary
                          hover:bg-primary/20
                          focus:ring-primary/30
                        `}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View deck
                      </Link>
                    )}

                    <Link
                      href={`/decks/${deck.id}/edit`}
                      className={`
                        ${ACTION_BASE}
                        border-border
                        bg-surface
                        text-foreground
                        hover:border-primary/50
                        hover:text-primary
                        focus:ring-primary/30
                      `}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteDialog(deck)
                      }
                      className={`
                        ${ACTION_BASE}
                        border-transparent
                        text-red-300/80
                        hover:border-red-500/30
                        hover:bg-red-500/10
                        hover:text-red-200
                        focus:ring-red-500/30
                      `}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {deckToDelete && (
        <DeleteDeckDialog
          deckName={deckToDelete.name}
          isDeleting={isDeletingDeck}
          error={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

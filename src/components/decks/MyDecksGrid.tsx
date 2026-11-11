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
  Trash2,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";

import { DECK_RULES } from "@/lib/decks/rules";

import type {
  UserDeckSummary,
} from "@/lib/decks/service";

import DeleteDeckDialog from "./DeleteDeckDialog";

interface MyDecksGridProps {
  initialDecks: UserDeckSummary[];
}

interface DeckMutationResponse {
  deck?: {
    id?: string;

    isPublic?: boolean;
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
        `“${deck.name}” necesita al menos ${DECK_RULES.mainMin} cartas en el Main Deck para publicarse.`
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
            "No se pudo cambiar la visibilidad del mazo."
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
          : "No se pudo cambiar la visibilidad del mazo."
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
            "No se pudo eliminar el mazo."
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
          : "No se pudo eliminar el mazo."
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
            Todavía no tienes mazos
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">
            Crea tu primer mazo, guárdalo como
            borrador y publícalo cuando esté
            completo.
          </p>

          <div className="mt-6 flex justify-center">
            <Button href="/decks/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Crear mi primer mazo
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
      label: "Todos",
      count: decks.length,
    },
    {
      key: "public",
      label: "Públicos",
      count: publicCount,
    },
    {
      key: "draft",
      label: "Borradores",
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
            aria-label="Cerrar aviso"
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filtrar mazos"
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
          Ordenados por actualización
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
            No hay mazos en este filtro
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            {filter === "public"
              ? "Publica un mazo para verlo aquí."
              : "Crea un borrador desde el builder para verlo aquí."}
          </p>

          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Ver todos los mazos
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
                            "Mazo personal"}
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
                          ? `${deck.name}: público. Cambiar a privado.`
                          : `${deck.name}: privado. Cambiar a público.`
                      }
                      title={
                        isUpdating
                          ? "Actualizando visibilidad..."
                          : deck.isPublic
                            ? "Hacer privado"
                            : cannotPublish
                              ? `Necesita ${DECK_RULES.mainMin} cartas en el Main Deck para publicarse`
                              : "Hacer público"
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
                        ? "Público"
                        : "Privado"}
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
                        "Sin skill"}
                    </span>
                  </div>

                  {deck.description && (
                    <p className="line-clamp-2 text-[11px] leading-4 text-foreground-muted">
                      {deck.description}
                    </p>
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
                      Actualizado el{" "}
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
                        ? "Publicado"
                        : "Borrador"}
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
                        Ver ficha
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
                      Editar
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
                      Eliminar
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

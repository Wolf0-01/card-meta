"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  Globe,
  Layers,
  Lock,
  Pencil,
  Plus,
  Trash2,
  X,
  Zap,
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
        px-2.5
        py-2
        ${classes}
      `}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-80">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-black tabular-nums">
        {value}

        <span className="text-[10px] font-semibold opacity-70">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {decks.map((deck) => {
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
                rounded-2xl
                border
                border-border
                bg-background-secondary
                transition-all
                duration-200
                hover:border-primary/50
                hover:shadow-xl
                hover:shadow-primary/5
              "
            >
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-primary
                      "
                    >
                      {deck.archetype?.name ??
                        "Mazo personal"}
                    </p>

                    <h2 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-foreground">
                      {deck.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={deck.isPublic}
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
                      px-2.5
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
                    ) : deck.isPublic ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}

                    {deck.isPublic
                      ? "Público"
                      : "Privado"}
                  </button>
                </div>

                <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-4 text-foreground-muted">
                  {deck.description ??
                    "Sin descripción. Abre el editor para añadir una estrategia."}
                </p>

                {deck.skill && (
                  <p
                    className="
                      mt-2
                      inline-flex
                      max-w-full
                      items-center
                      gap-1
                      rounded-md
                      border
                      border-amber-500/30
                      bg-amber-500/10
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      text-amber-300
                    "
                  >
                    <Zap className="h-3 w-3 shrink-0" />

                    <span className="truncate">
                      {deck.skill}
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-auto space-y-3 px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
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

                  <Counter
                    label="Side"
                    value={deck.counts.side}
                    max={DECK_RULES.sideMax}
                    highlight={
                      deck.counts.side > 0
                        ? "success"
                        : "neutral"
                    }
                  />
                </div>

                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    border-t
                    border-border/70
                    pt-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <p className="text-[10px] text-foreground-muted">
                    Actualizado el{" "}
                    {formatDate(deck.updatedAt)}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/decks/${deck.id}/edit`}
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-primary/40
                        bg-primary/10
                        px-2.5
                        py-1.5
                        text-[11px]
                        font-semibold
                        text-primary
                        transition-colors
                        hover:bg-primary/20
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary/30
                      "
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteDialog(deck)
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-transparent
                        px-2.5
                        py-1.5
                        text-[11px]
                        font-semibold
                        text-red-300/80
                        transition-colors
                        hover:border-red-500/30
                        hover:bg-red-500/10
                        hover:text-red-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-500/30
                      "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

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

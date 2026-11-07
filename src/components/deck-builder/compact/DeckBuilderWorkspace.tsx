"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Button from "@/components/ui/Button";

import useDeckDraft, {
  type DeckDraftSeed,
} from "@/hooks/useDeckDraft";

import { DECK_RULES } from "@/lib/decks/rules";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import CardSearchSidebar from "./CardSearchSidebar";

import DraftZone from "./DraftZone";

export interface EditableDeckData
  extends DeckDraftSeed {
  id: string;
}

interface DeckBuilderWorkspaceProps {
  initialDeck?: EditableDeckData;
}

interface SaveDeckResponse {
  deck?: {
    id?: string;

    slug?: string;

    identifier?: string;
  };

  error?: string;

  issues?: Array<{
    message: string;
  }>;
}

type SavingMode = "draft" | "publish" | null;

const statCards: Array<{
  key: DeckZone;
  label: string;
  limit: number;
  min?: number;
}> = [
  {
    key: "main",
    label: "Main",
    limit: DECK_RULES.mainMax,
    min: DECK_RULES.mainMin,
  },
  {
    key: "extra",
    label: "Extra",
    limit: DECK_RULES.extraMax,
  },
  {
    key: "side",
    label: "Side",
    limit: DECK_RULES.sideMax,
  },
];

function getStatClasses(
  zone: DeckZone,
  total: number,
  limit: number,
  min?: number
) {
  if (total > limit) {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }

  if (zone === "main" && min) {
    return total >= min
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }

  return total > 0
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
    : "border-border bg-surface text-foreground-muted";
}

export default function DeckBuilderWorkspace({
  initialDeck,
}: DeckBuilderWorkspaceProps = {}) {
  const router = useRouter();

  const draft = useDeckDraft(
    initialDeck
      ? {
          initialDraft: initialDeck,

          storageKey: null,
        }
      : undefined
  );

  const isEditing =
    initialDeck !== undefined;

  const [savingMode, setSavingMode] =
    useState<SavingMode>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const cardsByZone = useMemo(
    () => ({
      main: draft.cards.filter(
        (card) => card.zone === "main"
      ),

      extra: draft.cards.filter(
        (card) => card.zone === "extra"
      ),

      side: draft.cards.filter(
        (card) => card.zone === "side"
      ),
    }),
    [draft.cards]
  );

  const copiesById = useMemo(() => {
    const copies: Record<number, number> = {};

    for (const card of draft.cards) {
      copies[card.id] =
        (copies[card.id] ?? 0) +
        card.quantity;
    }

    return copies;
  }, [draft.cards]);

  const missingForPublish = Math.max(
    DECK_RULES.mainMin - draft.stats.main,
    0
  );

  const cleanName = draft.name.trim();

  const isSaving = savingMode !== null;

  /*
   * Al editar un mazo ya publicado, guardar cambios
   * mantiene la visibilidad y, por tanto, también
   * debe cumplir el mínimo del Main Deck.
   */
  const saveRequiresPublish =
    initialDeck?.isPublic ?? false;

  const canSave =
    !isSaving &&
    cleanName.length > 0 &&
    draft.validation.canSave &&
    (!saveRequiresPublish ||
      draft.validation.canPublish);

  const canPublish =
    !isSaving &&
    cleanName.length > 0 &&
    draft.validation.canPublish;

  const hint = (() => {
    if (!cleanName) {
      return {
        text: "Ponle un nombre al mazo para guardarlo.",
        className: "text-amber-300",
      };
    }

    if (draft.validation.issues.length > 0) {
      return {
        text: draft.validation.issues[0]
          .message,
        className: "text-red-300",
      };
    }

    if (missingForPublish > 0) {
      return {
        text:
          missingForPublish === 1
            ? "Falta 1 carta en el Main Deck para publicar."
            : `Faltan ${missingForPublish} cartas en el Main Deck para publicar.`,
        className: "text-amber-300",
      };
    }

    return {
      text: "Mazo listo para publicar.",
      className: "text-emerald-300",
    };
  })();

  function handleAddCard(
    card: CardPreviewData,
    zone?: DeckZone
  ) {
    draft.addCard(card, zone);

    setError(null);
  }

  async function handleSave(
    publish: boolean
  ) {
    if (isSaving) {
      return;
    }

    if (!cleanName) {
      setError(
        "El mazo necesita un nombre para guardarse."
      );

      return;
    }

    if (!draft.validation.canSave) {
      setError(
        draft.validation.issues
          .map((issue) => issue.message)
          .join(" ")
      );

      return;
    }

    const makePublic =
      publish ||
      (initialDeck?.isPublic ?? false);

    if (
      makePublic &&
      !draft.validation.canPublish
    ) {
      setError(
        draft.validation.publishIssues
          .map((issue) => issue.message)
          .join(" ")
      );

      return;
    }

    setSavingMode(
      publish ? "publish" : "draft"
    );

    setError(null);

    try {
      const response = await fetch(
        initialDeck
          ? `/api/decks/${initialDeck.id}`
          : "/api/decks",
        {
          method: initialDeck
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,

            description:
              draft.description.trim() ||
              null,

            format: "Advanced",

            isPublic: makePublic,

            cards: draft.cards.map(
              (card) => ({
                id: card.id,

                quantity: card.quantity,

                zone: card.zone,
              })
            ),
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | SaveDeckResponse
        | null;

      if (!response.ok) {
        const issueText = Array.isArray(
          data?.issues
        )
          ? data.issues
              .map((issue) => issue.message)
              .join(" ")
          : "";

        throw new Error(
          [
            data?.error ??
              "No se pudo guardar el mazo.",
            issueText,
          ]
            .filter(Boolean)
            .join(" ")
        );
      }

      if (initialDeck) {
        router.push(
          "/decks/mine?updated=1"
        );

        return;
      }

      const deck = data?.deck;

      draft.clearDeck();

      if (
        publish &&
        deck?.slug &&
        deck?.identifier
      ) {
        router.push(
          `/decks/${deck.slug}/${deck.identifier}`
        );

        return;
      }

      router.push("/decks/mine?created=1");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el mazo."
      );

      setSavingMode(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 lg:px-6">
        <div
          className="
            mb-4
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-primary
              "
            >
              Deck Builder
            </p>

            <h1
              className="
                text-xl
                font-black
                text-foreground
                sm:text-2xl
              "
            >
              {isEditing
                ? "Editar mazo"
                : "Nuevo mazo"}
              <span className="ml-2 text-sm font-semibold text-foreground-muted">
                Advanced
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant={
                    initialDeck?.isPublic
                      ? "success"
                      : "secondary"
                  }
                  size="sm"
                  onClick={() =>
                    handleSave(false)
                  }
                  disabled={!canSave}
                >
                  {savingMode === "draft"
                    ? "Guardando..."
                    : "Guardar cambios"}
                </Button>

                {!initialDeck?.isPublic && (
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={() =>
                      handleSave(true)
                    }
                    disabled={!canPublish}
                  >
                    {savingMode === "publish"
                      ? "Publicando..."
                      : "Publicar mazo"}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleSave(false)
                  }
                  disabled={!canSave}
                >
                  {savingMode === "draft"
                    ? "Guardando..."
                    : "Guardar borrador"}
                </Button>

                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={() =>
                    handleSave(true)
                  }
                  disabled={!canPublish}
                >
                  {savingMode === "publish"
                    ? "Publicando..."
                    : "Publicar mazo"}
                </Button>
              </>
            )}
          </div>
        </div>

        <section
          className="
            mb-4
            rounded-2xl
            border
            border-border
            bg-background-secondary
            p-3
          "
        >
          <div
            className="
              grid
              gap-2
              md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]
            "
          >
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-foreground-muted">
                Nombre del mazo
              </span>

              <input
                value={draft.name}
                onChange={(event) =>
                  draft.setName(
                    event.target.value
                  )
                }
                placeholder="Ej. Blue-Eyes Chaos MAX"
                maxLength={80}
                className="
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-surface
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-foreground
                  outline-none
                  transition-colors
                  placeholder:font-normal
                  placeholder:text-foreground-muted
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-foreground-muted">
                Descripción
                <span className="ml-1 font-normal normal-case tracking-normal">
                  (opcional)
                </span>
              </span>

              <input
                value={draft.description}
                onChange={(event) =>
                  draft.setDescription(
                    event.target.value
                  )
                }
                placeholder="Arquetipo, estrategia, combos..."
                maxLength={500}
                className="
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-surface
                  px-3
                  py-2
                  text-sm
                  text-foreground
                  outline-none
                  transition-colors
                  placeholder:text-foreground-muted
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
              />
            </label>
          </div>

          <div
            className="
              mt-3
              flex
              flex-col
              gap-2
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex flex-wrap gap-1.5">
              {statCards.map((stat) => {
                const total =
                  draft.stats[stat.key];

                return (
                  <span
                    key={stat.key}
                    className={`
                      rounded-md
                      border
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      tabular-nums
                      ${getStatClasses(
                        stat.key,
                        total,
                        stat.limit,
                        stat.min
                      )}
                    `}
                  >
                    {stat.label}{" "}
                    <span className="text-xs font-black">
                      {total}
                    </span>
                    /{stat.limit}
                  </span>
                );
              })}
            </div>

            <p
              className={`text-[11px] font-semibold ${hint.className}`}
            >
              {hint.text}
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="
              mb-4
              rounded-xl
              border
              border-red-500/40
              bg-red-500/10
              px-3
              py-2
              text-xs
              text-red-200
            "
          >
            {error}
          </div>
        )}

        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-start
          "
        >
          <CardSearchSidebar
            copiesById={copiesById}
            onAddCard={handleAddCard}
            className="
              h-[460px]
              shrink-0
              lg:sticky
              lg:top-20
              lg:h-[calc(100vh-6.5rem)]
              lg:w-[370px]
            "
          />

          <div className="min-w-0 flex-1 space-y-4">
            <DraftZone
              zone="main"
              cards={cardsByZone.main}
              total={draft.stats.main}
              limit={DECK_RULES.mainMax}
              min={DECK_RULES.mainMin}
              onAddCard={handleAddCard}
              onMoveCard={draft.moveCard}
              onRemoveOne={draft.removeCard}
              onRemoveAll={(
                cardId,
                zone
              ) =>
                draft.setQuantity(
                  cardId,
                  zone,
                  0
                )
              }
              scrollable
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <DraftZone
                zone="extra"
                cards={cardsByZone.extra}
                total={draft.stats.extra}
                limit={DECK_RULES.extraMax}
                onAddCard={handleAddCard}
                onMoveCard={draft.moveCard}
                onRemoveOne={draft.removeCard}
                onRemoveAll={(
                  cardId,
                  zone
                ) =>
                  draft.setQuantity(
                    cardId,
                    zone,
                    0
                  )
                }
              />

              <DraftZone
                zone="side"
                cards={cardsByZone.side}
                total={draft.stats.side}
                limit={DECK_RULES.sideMax}
                onAddCard={handleAddCard}
                onMoveCard={draft.moveCard}
                onRemoveOne={draft.removeCard}
                onRemoveAll={(
                  cardId,
                  zone
                ) =>
                  draft.setQuantity(
                    cardId,
                    zone,
                    0
                  )
                }
              />
            </div>

            <div
              className="
                flex
                flex-col
                gap-2
                rounded-xl
                border
                border-border
                bg-background-secondary
                px-3
                py-2.5
                text-[11px]
                text-foreground-muted
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <span>
                Arrastra las cartas entre zonas ·
                Clic derecho para quitar una copia
              </span>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Vaciar el mazo y empezar de nuevo?"
                    )
                  ) {
                    draft.clearDeck();

                    setError(null);
                  }
                }}
                className="
                  self-start
                  font-semibold
                  text-foreground-muted
                  transition-colors
                  hover:text-red-300
                  sm:self-auto
                "
              >
                Vaciar mazo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

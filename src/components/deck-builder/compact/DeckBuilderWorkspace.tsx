"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Button from "@/components/ui/Button";

import SkillHoverCard from "@/components/decks/SkillHoverCard";

import useDeckDraft, {
  type DeckDraftSeed,
} from "@/hooks/useDeckDraft";

import { DECK_RULES } from "@/lib/decks/rules";

import type { DuelFormat } from "@/lib/duelFormat";

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

  /*
   * Mazo de partida clonado de uno publicado
   * (botón "Build in Deck Builder"). Precarga
   * las cartas pero guarda como mazo nuevo.
   */
  templateDeck?: DeckDraftSeed;
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

export default function DeckBuilderWorkspace({
  initialDeck,
  templateDeck,
}: DeckBuilderWorkspaceProps = {}) {
  const router = useRouter();

  const draft = useDeckDraft(
    initialDeck || templateDeck
      ? {
          initialDraft:
            initialDeck ?? templateDeck,

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
    }),
    [draft.cards]
  );

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
        text: "Give the deck a name to save it.",
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
            ? "1 more card is needed in the Main Deck to publish."
            : `${missingForPublish} more cards are needed in the Main Deck to publish.`,
        className: "text-amber-300",
      };
    }

    return {
      text: "Deck ready to publish.",
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

  function handleFormatChange(
    nextFormat: DuelFormat
  ) {
    if (nextFormat === draft.format) {
      return;
    }

    if (
      nextFormat === "rush" &&
      (draft.stats.extra > 0 ||
        draft.skill.trim().length > 0)
    ) {
      const confirmed = window.confirm(
        "Rush Duel does not use the Extra Deck or Speed Skills. Extra Deck cards and the assigned Skill will be removed. Continue?"
      );

      if (!confirmed) {
        return;
      }
    }

    draft.setFormat(nextFormat);

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
        "The deck needs a name to be saved."
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

            skill:
              draft.format === "rush"
                ? null
                : draft.skill.trim() || null,

            format: draft.format,

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
              "Could not save the deck.",
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
          : "Could not save the deck."
      );

      setSavingMode(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-4 lg:px-6">
        <div
          className="
            mb-4
            mx-auto
            flex
            max-w-[1000px]
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
                ? "Edit deck"
                : "New deck"}
              <span className="ml-2 text-sm font-semibold text-foreground-muted">
                {draft.format === "rush"
                  ? "Rush Duel"
                  : "Speed Duel"}
              </span>
            </h1>

            <div
              role="group"
              aria-label="Deck format"
              className="
                mt-2
                inline-flex
                items-center
                gap-1
                rounded-lg
                border
                border-border
                bg-background-secondary
                p-1
              "
            >
              {(
                [
                  {
                    value: "speed",
                    label: "Speed",
                  },
                  {
                    value: "rush",
                    label: "Rush",
                  },
                ] as const
              ).map((item) => {
                const active =
                  draft.format === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      handleFormatChange(
                        item.value
                      )
                    }
                    className={`
                      rounded-md
                      px-3
                      py-1
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      transition-colors
                      ${
                        active
                          ? "bg-primary text-white shadow-sm"
                          : "text-foreground-muted hover:text-foreground"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
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
                    ? "Saving..."
                    : "Save changes"}
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
                      ? "Publishing..."
                      : "Publish deck"}
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
                    ? "Saving..."
                    : "Save draft"}
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
                    ? "Publishing..."
                    : "Publish deck"}
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="
              mb-4
              mx-auto
              max-w-[1000px]
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
            mx-auto
            flex
            max-w-[1000px]
            flex-col
            items-start
            justify-center
            gap-4
            lg:flex-row
          "
        >
          <CardSearchSidebar
            format={draft.format}
            onAddCard={handleAddCard}
            activeSkill={draft.skill}
            onSelectSkill={draft.setSkill}
            className="
              h-[560px]
              w-full
              shrink-0
              lg:sticky
              lg:top-4
              lg:h-[calc(100vh-2rem)]
              lg:w-[540px]
            "
          />

          <div className="min-w-0 flex-1 space-y-3 max-w-[440px]">
            <div
              className="
                grid
                gap-2
                sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]
              "
            >
              <label className="block">
                <span className="sr-only">
                  Deck name
                </span>

                <input
                  value={draft.name}
                  onChange={(event) =>
                    draft.setName(
                      event.target.value
                    )
                  }
                  placeholder="Deck name"
                  maxLength={80}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-background-secondary
                    px-3
                    py-2
                    text-base
                    font-black
                    text-foreground
                    outline-none
                    transition-colors
                    placeholder:font-semibold
                    placeholder:text-foreground-muted
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />
              </label>

              <label className="block">
                <span className="sr-only">
                  Deck description
                </span>

                <input
                  value={draft.description}
                  onChange={(event) =>
                    draft.setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Description (optional)"
                  maxLength={500}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-background-secondary
                    px-3
                    py-2.5
                    text-xs
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

            {draft.format !== "rush" && (
            <SkillHoverCard
              skillName={draft.skill}
              cards={cardsByZone.main}
              className="
                flex
                items-center
                justify-between
                gap-3
                rounded-xl
                border
                border-border
                bg-background-secondary
                px-3.5
                py-2.5
              "
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  aria-hidden
                  className="
                    h-2.5
                    w-2.5
                    shrink-0
                    rotate-45
                    rounded-[2px]
                    bg-amber-400
                    shadow-[0_0_10px_rgba(251,191,36,0.6)]
                  "
                />

                <span
                  className="
                    shrink-0
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-foreground-muted
                  "
                >
                  Skill
                </span>

                <input
                  value={draft.skill}
                  onChange={(event) =>
                    draft.setSkill(
                      event.target.value
                    )
                  }
                  placeholder="No skill assigned"
                  maxLength={120}
                  aria-label="Skill assigned to the deck"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-xs
                    font-semibold
                    text-foreground
                    outline-none
                    placeholder:font-normal
                    placeholder:text-foreground-muted
                  "
                />
              </div>

              <span
                className="
                  shrink-0
                  text-xs
                  font-black
                  tabular-nums
                  text-foreground
                "
              >
                {draft.stats.main} cards
              </span>
            </SkillHoverCard>
            )}

            {draft.format === "rush" && (
              <p
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background-secondary
                  px-3.5
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-foreground-muted
                "
              >
                Rush Duel does not use Speed Skills
                or an Extra Deck. The deck is built
                only with the Main Deck.
              </p>
            )}

            <DraftZone
              zone="main"
              cards={cardsByZone.main}
              total={draft.stats.main}
              limit={DECK_RULES.mainMax}
              min={DECK_RULES.mainMin}
              onAddCard={handleAddCard}
              onMoveCard={draft.moveCard}
              onRemoveOne={draft.removeCard}
              scrollable
            />

            {draft.format !== "rush" && (
              <DraftZone
                zone="extra"
                cards={cardsByZone.extra}
                total={draft.stats.extra}
                limit={DECK_RULES.extraMax}
                onAddCard={handleAddCard}
                onMoveCard={draft.moveCard}
                onRemoveOne={draft.removeCard}
                showTitle={false}
              />
            )}

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
                {draft.format === "rush"
                  ? "Right-click to remove one copy"
                  : "Drag cards between zones · Right-click to remove one copy"}
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`font-semibold ${hint.className}`}
                >
                  {hint.text}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Clear the deck and start over?"
                      )
                    ) {
                      draft.clearDeck();

                      setError(null);
                    }
                  }}
                  className="
                    font-semibold
                    text-foreground-muted
                    transition-colors
                    hover:text-red-300
                  "
                >
                  Clear deck
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

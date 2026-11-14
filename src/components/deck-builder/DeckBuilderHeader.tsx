"use client";

import Button from "@/components/ui/Button";

import {
  BuilderDeck,
  BuilderDeckStats,
} from "@/types/deck-builder";

interface DeckBuilderHeaderProps {
  deck: BuilderDeck;

  stats: BuilderDeckStats;

  onSave?: () => void;

  onDeckNameChange?: (
    name: string
  ) => void;

  isSaving?: boolean;

  saveMessage?: string | null;

  onImport?: () => void;

  onExport?: () => void;
}

export default function DeckBuilderHeader({
  deck,
  stats,
  onSave,
  onDeckNameChange,
  isSaving = false,
  saveMessage,
  onImport,
  onExport,
}: DeckBuilderHeaderProps) {
  return (
    <header
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <h1
            className="
              text-3xl
              font-black
              text-white
            "
          >
            Deck Builder
          </h1>

          {onDeckNameChange && (
            <label
              className="
                mt-4
                block
              "
            >
              <span
                className="
                  text-sm
                  text-zinc-400
                "
              >
                Deck name
              </span>

              <input
                value={deck.name}
                onChange={(event) =>
                  onDeckNameChange(
                    event.target.value
                  )
                }
                maxLength={80}
                className="
                  mt-1
                  w-full
                  rounded-lg
                  border
                  border-zinc-700
                  bg-zinc-950
                  px-3
                  py-2
                  text-white
                  outline-none
                  focus:border-blue-500
                "
              />
            </label>
          )}

          {deck.description && (
            <p
              className="
                mt-2
                text-zinc-400
              "
            >
              {deck.description}
            </p>
          )}

          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-3
            "
          >
            {deck.archetype && (
              <span
                className="
                  rounded-full
                  bg-blue-500/20
                  px-3
                  py-1
                  text-sm
                  text-blue-300
                "
              >
                {deck.archetype}
              </span>
            )}

            {deck.skill && (
              <span
                className="
                  rounded-full
                  bg-purple-500/20
                  px-3
                  py-1
                  text-sm
                  text-purple-300
                "
              >
                {deck.skill}
              </span>
            )}

            {deck.format && (
              <span
                className="
                  rounded-full
                  bg-zinc-800
                  px-3
                  py-1
                  text-sm
                "
              >
                {deck.format}
              </span>
            )}
          </div>
        </div>

        <div
          className="
            flex
            flex-col
            gap-4
            lg:items-end
          "
        >
          <div
            className="
              flex
              flex-wrap
              gap-4
              text-sm
              text-zinc-400
            "
          >
            <span>
              Main:{" "}
              <strong>
                {stats.main}/30
              </strong>
            </span>

            <span>
              Extra:{" "}
              <strong>
                {stats.extra}/8
              </strong>
            </span>

            <span>
              Total:{" "}
              <strong>
                {stats.total}
              </strong>
            </span>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <Button
              variant="secondary"
              onClick={onImport}
            >
              Import
            </Button>

            <Button
              variant="secondary"
              onClick={onExport}
            >
              Export
            </Button>

            <Button
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : "Publish Deck"}
            </Button>
          </div>

          {saveMessage && (
            <p
              className="
                text-sm
                text-zinc-400
              "
            >
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
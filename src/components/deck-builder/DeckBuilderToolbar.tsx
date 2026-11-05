"use client";

import Button from "@/components/ui/Button";

interface DeckBuilderToolbarProps {
  onClear?: () => void;

  onSort?: () => void;

  onShuffle?: () => void;

  onUndo?: () => void;

  onRedo?: () => void;
}

export default function DeckBuilderToolbar({
  onClear,
  onSort,
  onShuffle,
  onUndo,
  onRedo,
}: DeckBuilderToolbarProps) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-4
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
        "
      >
        <Button
          variant="secondary"
          onClick={onSort}
        >
          Sort
        </Button>

        <Button
          variant="secondary"
          onClick={onShuffle}
        >
          Shuffle
        </Button>

        <Button
          variant="secondary"
          onClick={onUndo}
        >
          Undo
        </Button>

        <Button
          variant="secondary"
          onClick={onRedo}
        >
          Redo
        </Button>

        <div className="flex-1" />

        <Button
          variant="danger"
          onClick={onClear}
        >
          Clear Deck
        </Button>
      </div>
    </section>
  );
}
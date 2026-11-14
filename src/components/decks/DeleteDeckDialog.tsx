"use client";

import {
  useEffect,
} from "react";

import {
  AlertTriangle,
} from "lucide-react";

import Button from "@/components/ui/Button";

interface DeleteDeckDialogProps {
  deckName: string;

  isDeleting: boolean;

  error: string | null;

  onCancel: () => void;

  onConfirm: () => void;
}

export default function DeleteDeckDialog({
  deckName,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteDeckDialogProps) {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !isDeleting
      ) {
        onCancel();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isDeleting, onCancel]);

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/80
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isDeleting
        ) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-deck-title"
        aria-describedby="delete-deck-description"
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-border
          bg-background-secondary
          p-5
          shadow-2xl
          shadow-black/50
        "
      >
        <div className="flex items-start gap-3">
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-red-500/30
              bg-red-500/10
              text-red-300
            "
          >
            <AlertTriangle className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h2
              id="delete-deck-title"
              className="text-base font-black text-foreground"
            >
              Delete deck
            </h2>

            <p
              id="delete-deck-description"
              className="mt-1 text-sm leading-6 text-foreground-muted"
            >
              You are about to delete{" "}
              <strong className="font-bold text-foreground">
                “{deckName}”
              </strong>
              . This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="
              mt-4
              rounded-lg
              border
              border-red-500/40
              bg-red-500/10
              px-3
              py-2
              text-xs
              leading-5
              text-red-200
            "
          >
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
            autoFocus
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : "Delete deck"}
          </Button>
        </div>
      </div>
    </div>
  );
}

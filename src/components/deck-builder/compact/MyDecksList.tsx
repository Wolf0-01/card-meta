"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState } from "react";

import Button from "@/components/ui/Button";

import type {
  UserDeckSummary,
} from "@/lib/decks/service";

interface MyDecksListProps {
  initialDecks: UserDeckSummary[];
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

export default function MyDecksList({
  initialDecks,
}: MyDecksListProps) {
  const router = useRouter();

  const [decks, setDecks] =
    useState<UserDeckSummary[]>(
      initialDecks
    );

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  async function handleDelete(
    deck: UserDeckSummary
  ) {
    if (
      !window.confirm(
        `¿Eliminar el mazo "${deck.name}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setDeletingId(deck.id);

    setError(null);

    try {
      const response = await fetch(
        `/api/decks/${deck.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "No se pudo eliminar el mazo."
        );
      }

      setDecks((current) =>
        current.filter(
          (item) => item.id !== deck.id
        )
      );

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el mazo."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (decks.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-border
          bg-background-secondary
          px-6
          py-12
          text-center
        "
      >
        <p className="text-3xl">
          🃏
        </p>

        <h2 className="mt-3 text-lg font-black text-foreground">
          Todavía no tienes mazos
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
          Crea tu primer mazo, guárdalo como
          borrador y publícalo cuando esté
          completo.
        </p>

        <div className="mt-6 flex justify-center">
          <Button href="/decks/new">
            Crear mi primer mazo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="
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

      <ul className="space-y-3">
        {decks.map((deck) => (
          <li
            key={deck.id}
            className="
              rounded-2xl
              border
              border-border
              bg-background-secondary
              p-4
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-black text-foreground">
                    {deck.name}
                  </h2>

                  <span
                    className={`
                      rounded-md
                      border
                      px-1.5
                      py-0.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      ${
                        deck.isPublic
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      }
                    `}
                  >
                    {deck.isPublic
                      ? "Público"
                      : "Borrador"}
                  </span>

                  <span className="text-[10px] text-foreground-muted">
                    {deck.format}
                  </span>
                </div>

                <p className="mt-1 text-xs text-foreground-muted">
                  Main {deck.counts.main} ·
                  Extra {deck.counts.extra} ·
                  Side {deck.counts.side} ·{" "}
                  {deck.counts.total} cartas
                </p>

                <p className="mt-0.5 text-[10px] text-foreground-muted">
                  Actualizado el{" "}
                  {formatDate(deck.updatedAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  href={`/decks/${deck.slug}/${deck.identifier}`}
                  className="
                    rounded-lg
                    border
                    border-border
                    bg-surface
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-foreground
                    transition-colors
                    hover:border-primary
                  "
                >
                  Ver mazo
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(deck)
                  }
                  disabled={
                    deletingId === deck.id
                  }
                  className="
                    rounded-lg
                    border
                    border-red-500/40
                    bg-red-500/10
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-red-300
                    transition-colors
                    hover:bg-red-500/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {deletingId === deck.id
                    ? "Eliminando..."
                    : "Eliminar"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

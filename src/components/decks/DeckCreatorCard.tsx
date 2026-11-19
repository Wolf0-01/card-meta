"use client";

import { formatDeckDate } from "@/lib/decks/formatDeckDate";

import type { MetaDeck } from "@/types/meta";

export { formatDeckDate };

interface Props {
  deck: MetaDeck;
}

export default function DeckCreatorCard({
  deck,
}: Props) {
  const author = deck.author ?? null;

  const displayName =
    author?.displayName?.trim() ||
    author?.username ||
    "Anonymous creator";

  const handle = author?.username
    ? `@${author.username}`
    : "Community";

  const initials = displayName
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-background-secondary
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.2em]
          text-foreground-muted
        "
      >
        Deck details
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-border
            bg-surface
            text-xs
            font-black
            text-foreground-secondary
          "
        >
          {author?.avatarUrl ? (
            // El avatar puede ser una URL externa del proveedor de auth.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-foreground">
            {displayName}
          </p>

          <p className="truncate text-[11px] text-foreground-muted">
            {handle}
          </p>
        </div>
      </div>

      <dl
        className="
          mt-4
          space-y-2
          border-t
          border-border
          pt-3
          text-xs
        "
      >
        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground-muted">
            Fecha
          </dt>

          <dd className="font-semibold text-foreground">
            {formatDeckDate(deck.createdAt)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground-muted">
            Skill
          </dt>

          <dd className="max-w-[60%] truncate text-right font-semibold text-foreground">
            {deck.skill?.trim() || "No skill"}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground-muted">
            Cards
          </dt>

          <dd className="font-semibold text-foreground">
            {deck.mainCards ?? 0} main ·{" "}
            {deck.extraCards ?? 0} extra
          </dd>
        </div>
      </dl>
    </div>
  );
}

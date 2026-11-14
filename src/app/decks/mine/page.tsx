import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import MyDecksGrid from "@/components/decks/MyDecksGrid";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { listUserDecks } from "@/lib/decks/service";

export const metadata: Metadata = {
  title: "My decks | Card Meta",

  description:
    "Manage your saved and published decks on Card Meta.",
};

interface MyDecksPageProps {
  searchParams: Promise<{
    created?: string;
    updated?: string;
  }>;
}

export default async function MyDecksPage({
  searchParams,
}: MyDecksPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/decks/mine");
  }

  const [decks, params] = await Promise.all([
    listUserDecks(user.id),

    searchParams,
  ]);

  const showCreatedNotice =
    params.created === "1";

  const showUpdatedNotice =
    params.updated === "1";

  const publicDeckCount = decks.filter(
    (deck) => deck.isPublic
  ).length;

  const draftDeckCount =
    decks.length - publicDeckCount;

  return (
    <main className="min-h-screen py-8">
      <Container size="xl">
        <header
          className="
            mb-6
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
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
              My collection
            </p>

            <h1
              className="
                text-2xl
                font-black
                text-foreground
              "
            >
              My decks
            </h1>

            <p className="mt-1 text-sm text-foreground-muted">
              {decks.length === 0
                ? "Save drafts and publish them when they are ready."
                : `${decks.length} deck${
                    decks.length === 1
                      ? ""
                      : "s"
                  } · ${publicDeckCount} public · ${draftDeckCount} draft${
                    draftDeckCount === 1
                      ? ""
                      : "s"
                  }`}
            </p>
          </div>

          <Button
            href="/decks/new"
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            New deck
          </Button>
        </header>

        {showCreatedNotice && (
          <div
            role="status"
            className="
              mb-4
              rounded-xl
              border
              border-emerald-500/40
              bg-emerald-500/10
              px-3
              py-2
              text-xs
              font-semibold
              text-emerald-300
            "
          >
            Draft saved successfully.
          </div>
        )}

        {showUpdatedNotice && (
          <div
            role="status"
            className="
              mb-4
              rounded-xl
              border
              border-emerald-500/40
              bg-emerald-500/10
              px-3
              py-2
              text-xs
              font-semibold
              text-emerald-300
            "
          >
            Changes saved successfully.
          </div>
        )}

        <MyDecksGrid initialDecks={decks} />
      </Container>
    </main>
  );
}

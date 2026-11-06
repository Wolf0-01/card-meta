import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import MyDecksList from "@/components/deck-builder/compact/MyDecksList";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { listUserDecks } from "@/lib/decks/service";

export const metadata: Metadata = {
  title: "Mis mazos | Card Meta",

  description:
    "Gestiona tus mazos guardados y publicados en Card Meta.",
};

interface MyDecksPageProps {
  searchParams: Promise<{
    created?: string;
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

  return (
    <main className="min-h-screen py-8">
      <Container size="lg">
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
              Mi colección
            </p>

            <h1
              className="
                text-2xl
                font-black
                text-foreground
              "
            >
              Mis mazos
            </h1>

            <p className="mt-1 text-sm text-foreground-muted">
              {decks.length === 0
                ? "Guarda borradores y publícalos cuando estén listos."
                : `${decks.length} mazo${
                    decks.length === 1
                      ? ""
                      : "s"
                  } guardado${
                    decks.length === 1
                      ? ""
                      : "s"
                  } en tu cuenta.`}
            </p>
          </div>

          <Button href="/decks/new">
            + Nuevo mazo
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
            Borrador guardado correctamente.
          </div>
        )}

        <MyDecksList initialDecks={decks} />
      </Container>
    </main>
  );
}

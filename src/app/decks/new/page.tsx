import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DeckBuilderWorkspace from "@/components/deck-builder/compact/DeckBuilderWorkspace";

import { getCurrentUser } from "@/lib/auth/currentUser";

export const metadata: Metadata = {
  title: "Nuevo mazo | Card Meta",

  description:
    "Construye tu mazo competitivo de Yu-Gi-Oh! con el editor compacto de Card Meta.",
};

export default async function NewDeckPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/decks/new");
  }

  return <DeckBuilderWorkspace />;
}

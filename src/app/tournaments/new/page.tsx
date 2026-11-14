import type { Metadata } from "next";

import { redirect } from "next/navigation";

import TournamentEditor from "@/components/tournaments/editor/TournamentEditor";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import { getTournamentDeckOptions } from "@/lib/tournaments/service";

export const metadata: Metadata = {
  title: "Add Tournament | Card Meta",

  description:
    "Register a real tournament and link each placement to a public deck.",
};

export default async function NewTournamentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/tournaments/new");
  }

  if (!canManageGuides(user)) {
    redirect("/tournaments");
  }

  const deckOptions =
    await getTournamentDeckOptions();

  return (
    <TournamentEditor
      mode="create"
      deckOptions={deckOptions}
    />
  );
}

import type { Metadata } from "next";

import {
  notFound,
  redirect,
} from "next/navigation";

import TournamentEditor from "@/components/tournaments/editor/TournamentEditor";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  getTournamentBannerOptions,
  getTournamentDeckOptions,
  getTournamentForEditorBySlug,
} from "@/lib/tournaments/service";

export const metadata: Metadata = {
  title: "Edit Tournament | Card Meta",

  description:
    "Edit the event details and standings of a tournament.",
};

interface EditTournamentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditTournamentPage({
  params,
}: EditTournamentPageProps) {
  const user = await getCurrentUser();

  const { slug } = await params;

  if (!user) {
    redirect(
      `/login?next=/tournaments/${slug}/edit`
    );
  }

  if (!canManageGuides(user)) {
    redirect("/tournaments");
  }

  const [
    tournament,
    deckOptions,
    bannerOptions,
  ] = await Promise.all([
    getTournamentForEditorBySlug(slug),

    getTournamentDeckOptions(),

    getTournamentBannerOptions(),
  ]);

  if (!tournament) {
    notFound();
  }

  return (
    <TournamentEditor
      mode="edit"
      initialTournament={tournament}
      deckOptions={deckOptions}
      bannerOptions={bannerOptions}
    />
  );
}

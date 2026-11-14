import type { Metadata } from "next";

import { redirect } from "next/navigation";

import GuideEditor from "@/components/guides/editor/GuideEditor";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import type { GuideCoverOption } from "@/lib/guides/editor";

import { getAllSetsWithBanners } from "@/lib/sets";

export const metadata: Metadata = {
  title: "Nueva guía | Card Meta",

  description:
    "Publica una nueva guía editorial con portada real y cartas destacadas.",
};

export default async function NewGuidePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/guides/new");
  }

  if (!canManageGuides(user)) {
    redirect("/guides");
  }

  const sets = await getAllSetsWithBanners();

  const coverOptions: GuideCoverOption[] =
    sets.map((set) => ({
      slug: set.slug,

      name: set.name,

      bannerUrl: set.bannerUrl,
    }));

  return (
    <GuideEditor
      mode="create"
      currentAuthor={
        user.displayName?.trim() ||
        user.username
      }
      coverOptions={coverOptions}
    />
  );
}

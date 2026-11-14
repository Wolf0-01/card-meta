import type { Metadata } from "next";

import { redirect } from "next/navigation";

import NewsEditor from "@/components/news/editor/NewsEditor";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import type { NewsCoverOption } from "@/lib/news/editor";

import { getAllSetsWithBanners } from "@/lib/sets";

export const metadata: Metadata = {
  title: "New Post | Card Meta",

  description:
    "Publish a new editorial article with a real cover and featured cards.",
};

export default async function NewNewsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/news/new");
  }

  if (!canManageGuides(user)) {
    redirect("/news");
  }

  const sets = await getAllSetsWithBanners();

  const coverOptions: NewsCoverOption[] =
    sets.map((set) => ({
      slug: set.slug,

      name: set.name,

      bannerUrl: set.bannerUrl,
    }));

  return (
    <NewsEditor
      mode="create"
      currentAuthor={
        user.displayName?.trim() ||
        user.username
      }
      coverOptions={coverOptions}
    />
  );
}

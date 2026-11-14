import type { Metadata } from "next";

import {
  notFound,
  redirect,
} from "next/navigation";

import NewsEditor from "@/components/news/editor/NewsEditor";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import type { NewsCoverOption } from "@/lib/news/editor";

import { getNewsForEditorBySlug } from "@/lib/news/service";

import { getAllSetsWithBanners } from "@/lib/sets";

export const metadata: Metadata = {
  title: "Edit Post | Card Meta",

  description:
    "Edit the content, cover and featured cards of an article.",
};

interface EditNewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditNewsPage({
  params,
}: EditNewsPageProps) {
  const user = await getCurrentUser();

  const { slug } = await params;

  if (!user) {
    redirect(
      `/login?next=/news/${slug}/edit`
    );
  }

  if (!canManageGuides(user)) {
    redirect("/news");
  }

  const [article, sets] = await Promise.all([
    getNewsForEditorBySlug(slug),

    getAllSetsWithBanners(),
  ]);

  if (!article) {
    notFound();
  }

  const coverOptions: NewsCoverOption[] =
    sets.map((set) => ({
      slug: set.slug,

      name: set.name,

      bannerUrl: set.bannerUrl,
    }));

  return (
    <NewsEditor
      mode="edit"
      initialArticle={article}
      currentAuthor={
        user.displayName?.trim() ||
        user.username
      }
      coverOptions={coverOptions}
    />
  );
}

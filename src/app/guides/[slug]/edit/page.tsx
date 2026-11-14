import type { Metadata } from "next";

import {
  notFound,
  redirect,
} from "next/navigation";

import GuideEditor from "@/components/guides/editor/GuideEditor";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import type { GuideCoverOption } from "@/lib/guides/editor";

import { getGuideForEditorBySlug } from "@/lib/guides/service";

import { getAllSetsWithBanners } from "@/lib/sets";

export const metadata: Metadata = {
  title: "Editar guía | Card Meta",

  description:
    "Edita el contenido, la portada y las cartas destacadas de una guía.",
};

interface EditGuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditGuidePage({
  params,
}: EditGuidePageProps) {
  const user = await getCurrentUser();

  const { slug } = await params;

  if (!user) {
    redirect(
      `/login?next=/guides/${slug}/edit`
    );
  }

  if (!canManageGuides(user)) {
    redirect("/guides");
  }

  const [guide, sets] = await Promise.all([
    getGuideForEditorBySlug(slug),

    getAllSetsWithBanners(),
  ]);

  if (!guide) {
    notFound();
  }

  const coverOptions: GuideCoverOption[] =
    sets.map((set) => ({
      slug: set.slug,

      name: set.name,

      bannerUrl: set.bannerUrl,
    }));

  return (
    <GuideEditor
      mode="edit"
      initialGuide={guide}
      currentAuthor={
        user.displayName?.trim() ||
        user.username
      }
      coverOptions={coverOptions}
    />
  );
}

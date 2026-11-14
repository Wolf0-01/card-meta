import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import {
  forbidden,
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  invalidJsonResponse,
  newsErrorResponse,
} from "@/lib/news/response";

import {
  deleteNews,
  updateNews,
} from "@/lib/news/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface NewsRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: NewsRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage news"
    );
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const article = await updateNews(
      id,
      body
    );

    revalidatePath("/news");

    revalidatePath(`/news/${article.slug}`);

    return NextResponse.json({
      article,
    });
  } catch (error) {
    return newsErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: NewsRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage news"
    );
  }

  const { id } = await params;

  try {
    const article = await deleteNews(id);

    revalidatePath("/news");

    revalidatePath(`/news/${article.slug}`);

    return NextResponse.json({
      article,
    });
  } catch (error) {
    return newsErrorResponse(error);
  }
}

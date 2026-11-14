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

import { createNews } from "@/lib/news/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage news"
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const article = await createNews(
      user,
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

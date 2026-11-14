import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import {
  forbidden,
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  guideErrorResponse,
  invalidJsonResponse,
} from "@/lib/guides/response";

import {
  deleteGuide,
  updateGuide,
} from "@/lib/guides/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface GuideRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: GuideRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "Necesitas rol EDITOR o ADMIN para gestionar guías"
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
    const guide = await updateGuide(
      id,
      body
    );

    revalidatePath("/guides");

    revalidatePath(`/guides/${guide.slug}`);

    return NextResponse.json({
      guide,
    });
  } catch (error) {
    return guideErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: GuideRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "Necesitas rol EDITOR o ADMIN para gestionar guías"
    );
  }

  const { id } = await params;

  try {
    const guide = await deleteGuide(id);

    revalidatePath("/guides");

    revalidatePath(`/guides/${guide.slug}`);

    return NextResponse.json({
      guide,
    });
  } catch (error) {
    return guideErrorResponse(error);
  }
}

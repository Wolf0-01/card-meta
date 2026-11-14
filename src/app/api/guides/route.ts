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

import { createGuide } from "@/lib/guides/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "Necesitas rol EDITOR o ADMIN para gestionar guías"
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const guide = await createGuide(
      user,
      body
    );

    revalidatePath("/guides");

    revalidatePath(`/guides/${guide.slug}`);

    return NextResponse.json(
      {
        guide,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return guideErrorResponse(error);
  }
}

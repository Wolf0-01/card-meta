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
  tournamentErrorResponse,
} from "@/lib/tournaments/response";

import { createTournament } from "@/lib/tournaments/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage tournaments"
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const tournament =
      await createTournament(body);

    revalidatePath("/tournaments");

    return NextResponse.json({
      tournament,
    });
  } catch (error) {
    return tournamentErrorResponse(error);
  }
}

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

import {
  deleteTournament,
  updateTournament,
} from "@/lib/tournaments/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface TournamentRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: TournamentRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage tournaments"
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
    const tournament =
      await updateTournament(id, body);

    revalidatePath("/tournaments");

    return NextResponse.json({
      tournament,
    });
  } catch (error) {
    return tournamentErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: TournamentRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage tournaments"
    );
  }

  const { id } = await params;

  try {
    const tournament =
      await deleteTournament(id);

    revalidatePath("/tournaments");

    return NextResponse.json({
      tournament,
    });
  } catch (error) {
    return tournamentErrorResponse(error);
  }
}

import { NextResponse } from "next/server";

import {
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import {
  deleteUserDeck,
  getDeckForViewer,
  updateUserDeck,
} from "@/lib/decks/service";

import {
  deckErrorResponse,
  invalidJsonResponse,
} from "@/lib/decks/response";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface DeckRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: DeckRouteContext
) {
  const { id } = await params;

  const user = await requireUser();

  try {
    const deck = await getDeckForViewer(
      id,
      user?.id ?? null
    );

    return NextResponse.json({
      deck,
    });
  } catch (error) {
    return deckErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: DeckRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const deck = await updateUserDeck(
      user.id,
      id,
      body
    );

    return NextResponse.json({
      deck,
    });
  } catch (error) {
    return deckErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: DeckRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  try {
    await deleteUserDeck(user.id, id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return deckErrorResponse(error);
  }
}

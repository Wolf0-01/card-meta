import { NextResponse } from "next/server";

import {
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  createUserDeck,
  listUserDecks,
} from "@/lib/decks/service";

import {
  deckErrorResponse,
  invalidJsonResponse,
} from "@/lib/decks/response";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  try {
    const decks = await listUserDecks(user.id);

    return NextResponse.json({
      decks,
    });
  } catch (error) {
    return deckErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const deck = await createUserDeck(
      user.id,
      body,
      {
        isStaff: canManageGuides(user),
      }
    );

    return NextResponse.json(
      {
        deck,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return deckErrorResponse(error);
  }
}

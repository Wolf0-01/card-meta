import { NextResponse } from "next/server";

import {
  forbidden,
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  deckErrorResponse,
  invalidJsonResponse,
} from "@/lib/decks/response";

import { setDeckResultVerification } from "@/lib/decks/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface VerifyRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: VerifyRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "Only editors and admins can approve competitive results"
    );
  }

  const { id } = await params;

  let verified = true;

  const contentType =
    request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return invalidJsonResponse();
    }

    if (
      body &&
      typeof body === "object" &&
      "verified" in body
    ) {
      verified = Boolean(
        (body as { verified?: unknown })
          .verified
      );
    }
  }

  try {
    const deck = await setDeckResultVerification(
      id,
      verified
    );

    return NextResponse.json({
      deck,
    });
  } catch (error) {
    return deckErrorResponse(error);
  }
}

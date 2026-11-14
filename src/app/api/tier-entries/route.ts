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
  tierEntryErrorResponse,
} from "@/lib/tier-entries/response";

import { createTierEntry } from "@/lib/tier-entries/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage the tier list"
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  try {
    const entry = await createTierEntry(body);

    revalidatePath("/tier-list");

    return NextResponse.json({
      entry,
    });
  } catch (error) {
    return tierEntryErrorResponse(error);
  }
}

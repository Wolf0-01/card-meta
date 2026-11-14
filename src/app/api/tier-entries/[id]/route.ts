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

import {
  deleteTierEntry,
  updateTierEntry,
} from "@/lib/tier-entries/service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface TierEntryRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: TierEntryRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage the tier list"
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
    const entry = await updateTierEntry(
      id,
      body
    );

    revalidatePath("/tier-list");

    return NextResponse.json({
      entry,
    });
  } catch (error) {
    return tierEntryErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: TierEntryRouteContext
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!canManageGuides(user)) {
    return forbidden(
      "You need the EDITOR or ADMIN role to manage the tier list"
    );
  }

  const { id } = await params;

  try {
    const entry = await deleteTierEntry(id);

    revalidatePath("/tier-list");

    return NextResponse.json({
      entry,
    });
  } catch (error) {
    return tierEntryErrorResponse(error);
  }
}

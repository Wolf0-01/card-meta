import { NextResponse } from "next/server";

import {
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import { prisma } from "@/lib/prisma";

import {
  isDefaultCardSort,
  type DefaultCardSort,
} from "@/lib/users/avatarPresets";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

interface SettingsBody {
  displayName?: unknown;

  avatarUrl?: unknown;

  defaultCardSort?: unknown;
}

function invalid(
  fieldErrors: Record<string, string>
) {
  return NextResponse.json(
    {
      error: "Please review the highlighted fields",

      fieldErrors,
    },
    {
      status: 400,
    }
  );
}

function parseOptionalText(
  value: unknown,
  maxLength: number
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    return undefined;
  }

  return trimmed.length > 0
    ? trimmed
    : null;
}

export async function PATCH(
  request: Request
) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  let body: SettingsBody;

  try {
    body = (await request.json()) as SettingsBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body",
      },
      {
        status: 400,
      }
    );
  }

  const fieldErrors: Record<string, string> =
    {};

  const displayName = parseOptionalText(
    body.displayName,
    40
  );

  if (
    body.displayName !== undefined &&
    displayName === undefined
  ) {
    fieldErrors.displayName =
      "Display name must be 40 characters or fewer.";
  }

  const avatarUrl = parseOptionalText(
    body.avatarUrl,
    600
  );

  if (
    body.avatarUrl !== undefined &&
    avatarUrl === undefined
  ) {
    fieldErrors.avatarUrl =
      "Avatar URL is too long.";
  }

  if (
    typeof avatarUrl === "string" &&
    !avatarUrl.startsWith("/") &&
    !avatarUrl.startsWith("http://") &&
    !avatarUrl.startsWith("https://")
  ) {
    fieldErrors.avatarUrl =
      "Use an absolute URL or a path starting with /.";
  }

  let defaultCardSort:
    | DefaultCardSort
    | undefined;

  if (body.defaultCardSort !== undefined) {
    if (
      typeof body.defaultCardSort !==
        "string" ||
      !isDefaultCardSort(
        body.defaultCardSort
      )
    ) {
      fieldErrors.defaultCardSort =
        "Choose a valid card sort.";
    } else {
      defaultCardSort =
        body.defaultCardSort;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return invalid(fieldErrors);
  }

  const updated = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      ...(displayName !== undefined
        ? { displayName }
        : {}),

      ...(avatarUrl !== undefined
        ? { avatarUrl }
        : {}),

      ...(defaultCardSort !== undefined
        ? { defaultCardSort }
        : {}),
    },

    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      defaultCardSort: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    user: updated,
  });
}

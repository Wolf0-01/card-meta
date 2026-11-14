import { NextResponse } from "next/server";

import { getCurrentUser } from "./currentUser";

import type { AuthUser } from "./currentUser";

export async function requireUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}

export function unauthorized() {
  return NextResponse.json(
    {
      error: "Not authenticated",
    },
    {
      status: 401,
    }
  );
}

export function forbidden(
  message = "You do not have permission to perform this action"
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status: 403,
    }
  );
}

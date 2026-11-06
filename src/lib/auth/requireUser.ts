import { NextResponse } from "next/server";

import { getCurrentUser } from "./currentUser";

import type { AuthUser } from "./currentUser";

export async function requireUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}

export function unauthorized() {
  return NextResponse.json(
    {
      error: "No autenticado",
    },
    {
      status: 401,
    }
  );
}

export function forbidden(
  message = "No tienes permiso para realizar esta acción"
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

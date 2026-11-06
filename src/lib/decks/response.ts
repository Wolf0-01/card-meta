import { NextResponse } from "next/server";

import { DeckError } from "./errors";

export function deckErrorResponse(error: unknown) {
  if (error instanceof DeckError) {
    return NextResponse.json(
      {
        error: error.message,

        code: error.code,

        issues: error.issues,
      },
      {
        status: error.status,
      }
    );
  }

  console.error("DECK API ERROR:", error);

  return NextResponse.json(
    {
      error: "Error interno del servidor",
    },
    {
      status: 500,
    }
  );
}

export function invalidJsonResponse() {
  return NextResponse.json(
    {
      error:
        "El cuerpo de la petición no es JSON válido",
    },
    {
      status: 400,
    }
  );
}

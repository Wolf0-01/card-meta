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
      error: "Internal server error",
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
        "The request body is not valid JSON",
    },
    {
      status: 400,
    }
  );
}

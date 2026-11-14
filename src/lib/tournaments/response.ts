import { NextResponse } from "next/server";

import { TournamentError } from "./errors";

export function tournamentErrorResponse(
  error: unknown
) {
  if (error instanceof TournamentError) {
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

  console.error("TOURNAMENT API ERROR:", error);

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

import { NextResponse } from "next/server";

import { TierEntryError } from "./errors";

export function tierEntryErrorResponse(
  error: unknown
) {
  if (error instanceof TierEntryError) {
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

  console.error("TIER ENTRY API ERROR:", error);

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

import { NextResponse } from "next/server";

import { importDeckFromYdk } from "@/lib/decks/importDeck";

export async function POST(
  request: Request
) {
  try {
    const { content } =
      await request.json();

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Deck content is required.",
        },
        {
          status: 400,
        }
      );
    }

    const deck =
      await importDeckFromYdk(
        content
      );

    return NextResponse.json(deck);
  } catch (error) {
    console.error(
      "Import deck error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to import deck.",
      },
      {
        status: 500,
      }
    );
  }
}
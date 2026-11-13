import { NextResponse } from "next/server";

import { queryCards } from "@/lib/queryCards";

export async function GET(
  request: Request
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const random =
      searchParams.get("random") ===
      "true";

    const limit = Math.min(
      Math.max(
        Number(
          searchParams.get("limit") ?? 50
        ) || 50,
        1
      ),
      100
    );

    const page = Math.max(
      Number(
        searchParams.get("page") ?? 1
      ) || 1,
      1
    );

    const search =
      searchParams.get("search") ?? "";

    const slug =
      searchParams.get("slug") ??
      undefined;

    const format =
      searchParams.get("format") ??
      undefined;

    const type =
      searchParams.get("type") ??
      undefined;

    const attribute =
      searchParams.get("attribute") ??
      undefined;

    const rarity =
      searchParams.get("rarity") ??
      undefined;

    const archetype =
      searchParams.get("archetype") ??
      undefined;

    const monsterType =
      searchParams.get(
        "monsterType"
      ) ?? undefined;

    const sort =
      searchParams.get("sort") ??
      undefined;

    const directionParam =
      searchParams.get("direction");

    const direction =
      directionParam === "desc"
        ? "desc"
        : directionParam === "asc"
          ? "asc"
          : undefined;

    function numberParam(
      key: string
    ) {
      const value =
        searchParams.get(key);

      return value
        ? Number(value)
        : undefined;
    }

    const level =
      numberParam("level");

    const minLevel =
      numberParam("minLevel");

    const maxLevel =
      numberParam("maxLevel");

    const minAttack =
      numberParam("minAtk");

    const maxAttack =
      numberParam("maxAtk");

    const minDefense =
      numberParam("minDef");

    const maxDefense =
      numberParam("maxDef");

    const result =
      await queryCards({
        search,
        slug,
        format,
        type,
        attribute,
        rarity,
        archetype,
        monsterType,
        level,
        minLevel,
        maxLevel,
        minAttack,
        maxAttack,
        minDefense,
        maxDefense,
        sort,
        direction,
        page,
        limit,
      });

    const cards = random
      ? [...result.cards]
          .sort(
            () => Math.random() - 0.5
          )
          .slice(0, limit)
      : result.cards;

    return NextResponse.json({
      cards,

      total: random
        ? cards.length
        : result.total,

      page: result.page,

      pageSize: result.pageSize,

      pages: result.pages,
    });
  } catch (error) {
    console.error(
      "API CARDS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error al obtener las cartas",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";

import { fetchDlmSkillByName } from "@/lib/skills/dlm";

import {
  findSkillByName,
  querySkills,
} from "@/lib/skills/search";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

function toNumber(
  value: string | null
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(
    request.url
  );

  const name = searchParams.get("name");

  if (name) {
    const skill =
      findSkillByName(name) ??
      (await fetchDlmSkillByName(name));

    return NextResponse.json({
      skill,
    });
  }

  const result = querySkills({
    search: searchParams.get("search") ?? undefined,

    character:
      searchParams.get("character") ?? undefined,

    page: toNumber(searchParams.get("page")),

    limit: toNumber(searchParams.get("limit")),
  });

  return NextResponse.json(result);
}

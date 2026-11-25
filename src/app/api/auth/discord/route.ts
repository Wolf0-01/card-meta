import { randomBytes } from "node:crypto";

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  DISCORD_AUTHORIZE_URL,
  DISCORD_NEXT_COOKIE,
  DISCORD_STATE_COOKIE,
  DISCORD_STATE_MAX_AGE_SECONDS,
  getDiscordConfig,
  safeDiscordNextPath,
} from "@/lib/auth/discord";

export const runtime = "nodejs";

const isProduction =
  process.env.NODE_ENV ===
  "production";

function oauthCookieOptions() {
  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: "lax" as const,

    path: "/",
  };
}

export async function GET(
  request: NextRequest
) {
  const config = getDiscordConfig();

  if (!config) {
    return NextResponse.json(
      {
        error:
          "Discord sign-in is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const state =
    randomBytes(32).toString("hex");

  const nextPath =
    safeDiscordNextPath(
      request.nextUrl.searchParams.get(
        "next"
      )
    );

  const authorizeUrl = new URL(
    DISCORD_AUTHORIZE_URL
  );

  authorizeUrl.searchParams.set(
    "client_id",
    config.clientId
  );

  authorizeUrl.searchParams.set(
    "redirect_uri",
    config.redirectUri
  );

  authorizeUrl.searchParams.set(
    "response_type",
    "code"
  );

  authorizeUrl.searchParams.set(
    "scope",
    "identify email"
  );

  authorizeUrl.searchParams.set(
    "state",
    state
  );

  const response =
    NextResponse.redirect(authorizeUrl);

  response.cookies.set(
    DISCORD_STATE_COOKIE,
    state,
    {
      ...oauthCookieOptions(),

      maxAge:
        DISCORD_STATE_MAX_AGE_SECONDS,
    }
  );

  response.cookies.set(
    DISCORD_NEXT_COOKIE,
    nextPath,
    {
      ...oauthCookieOptions(),

      maxAge:
        DISCORD_STATE_MAX_AGE_SECONDS,
    }
  );

  return response;
}

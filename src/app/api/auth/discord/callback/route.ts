import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import {
  DISCORD_NEXT_COOKIE,
  DISCORD_STATE_COOKIE,
  DISCORD_STATE_MAX_AGE_SECONDS,
  DISCORD_TOKEN_URL,
  DISCORD_USER_URL,
  buildDiscordAvatarUrl,
  buildUsernameCandidates,
  getDiscordConfig,
  normalizeDiscordDisplayName,
  safeDiscordNextPath,
} from "@/lib/auth/discord";

import type {
  DiscordProfile,
} from "@/lib/auth/discord";

import { createSession } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma";

import { emailSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

const isProduction =
  process.env.NODE_ENV ===
  "production";

interface DiscordTokenResponse {
  access_token?: string;

  error?: string;
}

function oauthCookieOptions() {
  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: "lax" as const,

    path: "/",
  };
}

function clearOAuthCookies(
  response: NextResponse
) {
  response.cookies.set(
    DISCORD_STATE_COOKIE,
    "",
    {
      ...oauthCookieOptions(),

      maxAge: 0,
    }
  );

  response.cookies.set(
    DISCORD_NEXT_COOKIE,
    "",
    {
      ...oauthCookieOptions(),

      maxAge: 0,
    }
  );

  return response;
}

function loginError(
  request: NextRequest,
  code: string
) {
  const url = new URL(
    "/login",
    request.url
  );

  url.searchParams.set(
    "discord_error",
    code
  );

  return clearOAuthCookies(
    NextResponse.redirect(url)
  );
}

function statesMatch(
  expected: string | undefined,
  received: string | null
) {
  if (!expected || !received) {
    return false;
  }

  const expectedBuffer =
    Buffer.from(expected);

  const receivedBuffer =
    Buffer.from(received);

  return (
    expectedBuffer.length ===
      receivedBuffer.length &&
    timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    )
  );
}

async function resolveDiscordUser(
  profile: DiscordProfile,
  email: string
) {
  const displayName =
    normalizeDiscordDisplayName(
      profile.global_name
    ) ??
    normalizeDiscordDisplayName(
      profile.username
    ) ??
    email.split("@")[0];

  const avatarUrl =
    buildDiscordAvatarUrl(
      profile.id,
      profile.avatar
    );

  const linkedUser =
    await prisma.user.findUnique({
      where: {
        discordId: profile.id,
      },
    });

  if (linkedUser) {
    const updates: {
      avatarUrl?: string;

      displayName?: string;
    } = {};

    if (!linkedUser.avatarUrl) {
      updates.avatarUrl = avatarUrl;
    }

    if (
      !linkedUser.displayName &&
      displayName
    ) {
      updates.displayName = displayName;
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return linkedUser;
    }

    return prisma.user.update({
      where: {
        id: linkedUser.id,
      },

      data: updates,
    });
  }

  const emailUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (emailUser) {
    if (
      emailUser.discordId &&
      emailUser.discordId !== profile.id
    ) {
      /*
       * La cuenta ya está vinculada a otro Discord:
       * no permitimos sobrescribir el vínculo.
       */
      return null;
    }

    const updates: {
      discordId: string;

      avatarUrl?: string;

      displayName?: string;
    } = {
      discordId: profile.id,
    };

    if (!emailUser.avatarUrl) {
      updates.avatarUrl = avatarUrl;
    }

    if (
      !emailUser.displayName &&
      displayName
    ) {
      updates.displayName = displayName;
    }

    return prisma.user.update({
      where: {
        id: emailUser.id,
      },

      data: updates,
    });
  }

  const candidates =
    buildUsernameCandidates(
      displayName ||
        profile.username,
      profile.id
    );

  let username =
    candidates[candidates.length - 1];

  for (const candidate of candidates) {
    if (
      candidate.length < 3 ||
      candidate.length > 24
    ) {
      continue;
    }

    const taken =
      await prisma.user.findUnique({
        where: {
          username: candidate,
        },

        select: {
          id: true,
        },
      });

    if (!taken) {
      username = candidate;

      break;
    }
  }

  return prisma.user.create({
    data: {
      email,

      username,

      displayName,

      avatarUrl,

      discordId: profile.id,

      role: "USER",
    },
  });
}

export async function GET(
  request: NextRequest
) {
  const config = getDiscordConfig();

  if (!config) {
    return loginError(
      request,
      "not_configured"
    );
  }

  const code =
    request.nextUrl.searchParams.get(
      "code"
    );

  const receivedState =
    request.nextUrl.searchParams.get(
      "state"
    );

  const oauthError =
    request.nextUrl.searchParams.get(
      "error"
    );

  if (oauthError) {
    return loginError(
      request,
      "access_denied"
    );
  }

  const expectedState =
    request.cookies.get(
      DISCORD_STATE_COOKIE
    )?.value;

  if (
    !code ||
    !statesMatch(
      expectedState,
      receivedState
    )
  ) {
    return loginError(
      request,
      "invalid_state"
    );
  }

  const nextPath =
    safeDiscordNextPath(
      request.cookies.get(
        DISCORD_NEXT_COOKIE
      )?.value
    );

  try {
    const tokenResponse = await fetch(
      DISCORD_TOKEN_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
          client_id: config.clientId,

          client_secret:
            config.clientSecret,

          grant_type:
            "authorization_code",

          code,

          redirect_uri:
            config.redirectUri,
        }),

        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      return loginError(
        request,
        "token_exchange_failed"
      );
    }

    const tokenData =
      (await tokenResponse
        .json()
        .catch(() => null)) as
        | DiscordTokenResponse
        | null;

    if (!tokenData?.access_token) {
      return loginError(
        request,
        "token_exchange_failed"
      );
    }

    const profileResponse = await fetch(
      DISCORD_USER_URL,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },

        cache: "no-store",
      }
    );

    if (!profileResponse.ok) {
      return loginError(
        request,
        "profile_fetch_failed"
      );
    }

    const rawProfile =
      (await profileResponse
        .json()
        .catch(() => null)) as
        | Partial<DiscordProfile>
        | null;

    if (
      !rawProfile ||
      typeof rawProfile.id !== "string" ||
      !rawProfile.id
    ) {
      return loginError(
        request,
        "profile_fetch_failed"
      );
    }

    const parsedEmail =
      emailSchema.safeParse(
        rawProfile.email ?? ""
      );

    if (!parsedEmail.success) {
      return loginError(
        request,
        "missing_email"
      );
    }

    const user =
      await resolveDiscordUser(
        {
          id: rawProfile.id,

          username:
            typeof rawProfile.username ===
            "string"
              ? rawProfile.username
              : "duelist",

          global_name:
            rawProfile.global_name,

          email: rawProfile.email,

          avatar: rawProfile.avatar,
        },
        parsedEmail.data
      );

    if (!user) {
      return loginError(
        request,
        "account_linked"
      );
    }

    await createSession({
      sub: user.id,

      email: user.email,

      username: user.username,

      role: user.role,
    });

    return clearOAuthCookies(
      NextResponse.redirect(
        new URL(
          nextPath,
          request.url
        )
      )
    );
  } catch (error) {
    console.error(
      "DISCORD OAUTH ERROR:",
      error
    );

    return loginError(
      request,
      "server_error"
    );
  }
}

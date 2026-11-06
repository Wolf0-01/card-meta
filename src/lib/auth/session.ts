import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./constants";

import {
  signSessionToken,
  verifySessionToken,
} from "./jwt";

import type {
  SessionPayload,
} from "./jwt";

const isProduction =
  process.env.NODE_ENV ===
  "production";

function cookieOptions() {
  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: "lax" as const,

    path: "/",
  };
}

export async function createSession(
  payload: SessionPayload
) {
  const token =
    await signSessionToken(payload);

  const store = await cookies();

  store.set(
    SESSION_COOKIE_NAME,
    token,
    {
      ...cookieOptions(),

      maxAge:
        SESSION_MAX_AGE_SECONDS,
    }
  );
}

export async function destroySession() {
  const store = await cookies();

  store.set(
    SESSION_COOKIE_NAME,
    "",
    {
      ...cookieOptions(),

      maxAge: 0,
    }
  );
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();

  const token = store.get(
    SESSION_COOKIE_NAME
  )?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

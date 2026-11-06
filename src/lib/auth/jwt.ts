import {
  jwtVerify,
  SignJWT,
} from "jose";

import {
  SESSION_AUDIENCE,
  SESSION_ISSUER,
  SESSION_MAX_AGE_SECONDS,
} from "./constants";

export type SessionRole =
  | "user"
  | "admin";

export interface SessionPayload {
  sub: string;

  email: string;

  username: string;

  role: SessionRole;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET no está definida o tiene menos de 32 caracteres."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload
) {
  return new SignJWT({
    email: payload.email,
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(payload.sub)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(
      `${SESSION_MAX_AGE_SECONDS}s`
    )
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } =
      await jwtVerify(
        token,
        getSecret(),
        {
          issuer: SESSION_ISSUER,
          audience: SESSION_AUDIENCE,
        }
      );

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.username !== "string" ||
      (payload.role !== "user" &&
        payload.role !== "admin")
    ) {
      return null;
    }

    return {
      sub: payload.sub,

      email: payload.email,

      username: payload.username,

      role: payload.role,
    };
  } catch {
    return null;
  }
}

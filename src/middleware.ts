import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";

import {
  verifySessionToken,
} from "@/lib/auth/jwt";

const protectedPagePatterns = [
  /^\/decks\/new(?:\/|$)/,
  /^\/decks\/[^/]+\/edit(?:\/|$)/,
  /^\/decks\/mine(?:\/|$)/,
];

function isProtectedPage(
  pathname: string
) {
  return protectedPagePatterns.some(
    (pattern) => pattern.test(pathname)
  );
}

export async function middleware(
  request: NextRequest
) {
  const { pathname, search } =
    request.nextUrl;

  if (!isProtectedPage(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    SESSION_COOKIE_NAME
  )?.value;

  const session = token
    ? await verifySessionToken(token)
    : null;

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL(
    "/login",
    request.url
  );

  loginUrl.searchParams.set(
    "next",
    `${pathname}${search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/decks/new/:path*",
    "/decks/mine/:path*",
    "/decks/:id/edit/:path*",
  ],
};

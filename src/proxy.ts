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

const guideEditorPagePatterns = [
  /^\/guides\/new(?:\/|$)/,
  /^\/guides\/[^/]+\/edit(?:\/|$)/,
];

const adminPagePatterns = [
  /^\/admin(?:\/|$)/,
];

const protectedPagePatterns = [
  /^\/decks\/new(?:\/|$)/,
  /^\/decks\/[^/]+\/edit(?:\/|$)/,
  /^\/decks\/mine(?:\/|$)/,
  ...guideEditorPagePatterns,
  ...adminPagePatterns,
];

function matchesAny(
  pathname: string,
  patterns: RegExp[]
) {
  return patterns.some((pattern) =>
    pattern.test(pathname)
  );
}

function isProtectedPage(
  pathname: string
) {
  return matchesAny(
    pathname,
    protectedPagePatterns
  );
}

function isGuideEditorPage(
  pathname: string
) {
  return matchesAny(
    pathname,
    guideEditorPagePatterns
  );
}

function isAdminPage(pathname: string) {
  return matchesAny(
    pathname,
    adminPagePatterns
  );
}

export async function proxy(
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

  if (!session) {
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

  if (
    isAdminPage(pathname) &&
    session.role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  if (
    isGuideEditorPage(pathname) &&
    session.role !== "ADMIN" &&
    session.role !== "EDITOR"
  ) {
    return NextResponse.redirect(
      new URL("/guides", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/decks/new/:path*",
    "/decks/mine/:path*",
    "/decks/:id/edit/:path*",
    "/guides/new/:path*",
    "/guides/:slug/edit/:path*",
    "/admin/:path*",
  ],
};

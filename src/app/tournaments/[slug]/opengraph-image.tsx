import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { formatDate, formatNumber } from "@/lib/format";
import { getTournamentBySlug } from "@/lib/tournaments";

export const runtime = "nodejs";
export const alt = "Tournament Report | Card Meta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
export const revalidate = 3600;

const FALLBACK_BACKGROUND = "#070D1F";
const BANNER_FETCH_TIMEOUT_MS = 2500;
const MAX_BANNER_BYTES = 8 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const SUPPORTED_BANNER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const BANNERS_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "banners"
);

const LOCAL_BANNER_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
]);

interface Props {
  params: Promise<{ slug: string }>;
}

function mimeTypeFromPath(value: string) {
  const pathname = value.split(/[?#]/, 1)[0] ?? value;

  return MIME_BY_EXTENSION[
    path.extname(pathname).toLowerCase()
  ] ?? null;
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: FALLBACK_BACKGROUND,
          color: "#FFFFFF",
          fontSize: 48,
          fontWeight: 900,
        }}
      >
        Card Meta · Tournament
      </div>
    ),
    size
  );
}

/**
 * Detecta banners que apuntan al propio dominio (o a localhost)
 * para leerlos desde disco en lugar de hacer una petición HTTP
 * circular contra el mismo despliegue.
 */
function pathnameFromLocalUrl(
  value: string
): string | null {
  if (value.startsWith("/")) {
    return value;
  }

  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim();

    let sameApp = false;

    if (appUrl) {
      try {
        sameApp =
          new URL(appUrl).host === url.host;
      } catch {
        sameApp = false;
      }
    }

    if (
      LOCAL_BANNER_HOSTS.has(url.hostname) ||
      sameApp
    ) {
      return url.pathname;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Lee banners locales desde public/banners y los convierte en
 * Data URLs. La ruta se limita a esa carpeta para que Turbopack
 * no trace todo el directorio public.
 */
async function localBannerDataUrl(
  bannerUrl: string
): Promise<string | null> {
  const pathname =
    bannerUrl.split(/[?#]/, 1)[0] ?? bannerUrl;

  let decodedPath = pathname;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    // Si la ruta tiene escapes inválidos, probamos con el valor original.
  }

  const relativePath = decodedPath.replace(
    /^\/+/,
    ""
  );

  const [directory, ...segments] =
    relativePath.split("/");

  if (
    directory !== "banners" ||
    segments.length === 0
  ) {
    return null;
  }

  const filePath = path.resolve(
    BANNERS_PUBLIC_DIR,
    segments.join("/")
  );

  if (
    !filePath.startsWith(
      `${BANNERS_PUBLIC_DIR}${path.sep}`
    )
  ) {
    return null;
  }

  const mimeType = mimeTypeFromPath(filePath);

  if (!mimeType) {
    return null;
  }

  try {
    const file = await readFile(filePath);

    if (file.byteLength > MAX_BANNER_BYTES) {
      return null;
    }

    return `data:${mimeType};base64,${file.toString(
      "base64"
    )}`;
  } catch {
    return null;
  }
}

/**
 * Descarga banners externos con un límite de tiempo. Cualquier
 * error, timeout o formato no soportado devuelve null para que la
 * imagen se genere igualmente con el fondo degradado.
 */
async function remoteBannerDataUrl(
  bannerUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(bannerUrl, {
      signal: AbortSignal.timeout(
        BANNER_FETCH_TIMEOUT_MS
      ),
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return null;
    }

    const declaredSize = Number(
      response.headers.get("content-length") ?? "0"
    );

    if (declaredSize > MAX_BANNER_BYTES) {
      return null;
    }

    const contentType = response.headers
      .get("content-type")
      ?.split(";")[0]
      ?.trim()
      .toLowerCase();

    const mimeType =
      contentType?.startsWith("image/")
        ? contentType
        : mimeTypeFromPath(bannerUrl);

    if (
      !mimeType ||
      !SUPPORTED_BANNER_MIME_TYPES.has(mimeType)
    ) {
      return null;
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    if (buffer.byteLength > MAX_BANNER_BYTES) {
      return null;
    }

    return `data:${mimeType};base64,${buffer.toString(
      "base64"
    )}`;
  } catch {
    return null;
  }
}

async function resolveBannerDataUrl(
  bannerUrl: string | null | undefined
): Promise<string | null> {
  if (!bannerUrl) {
    return null;
  }

  const value = bannerUrl.trim();

  if (!value) {
    return null;
  }

  if (value.startsWith("data:image/")) {
    return value;
  }

  const localPathname = pathnameFromLocalUrl(value);

  if (localPathname) {
    return localBannerDataUrl(localPathname);
  }

  if (/^https?:\/\//i.test(value)) {
    return remoteBannerDataUrl(value);
  }

  if (!value.includes("://")) {
    return localBannerDataUrl(`/${value}`);
  }

  return null;
}

export default async function TournamentOgImage({
  params,
}: Props) {
  const { slug } = await params;

  const tournament = await getTournamentBySlug(
    slug
  ).catch(() => null);

  if (!tournament) {
    return fallbackImage();
  }

  const bannerDataUrl = await resolveBannerDataUrl(
    tournament.bannerUrl
  );

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "relative",
            backgroundColor: FALLBACK_BACKGROUND,
            padding: "56px",
            color: "#FFFFFF",
          }}
        >
          {bannerDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerDataUrl}
              alt=""
              style={{
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.78,
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(to top, rgba(7,13,31,0.96) 10%, rgba(7,13,31,0.55) 55%, rgba(7,13,31,0.15) 100%)",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    "rgba(251,191,36,0.18)",
                  border:
                    "1px solid rgba(251,191,36,0.45)",
                  color: "#FDE68A",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: 20,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {tournament.organizer}
              </span>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#CBD5E1",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {formatDate(tournament.date)} ·{" "}
                {tournament.format} ·{" "}
                {formatNumber(tournament.players)} players
              </span>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 60,
                fontWeight: 900,
                lineHeight: 1.08,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
              }}
            >
              {tournament.name}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 800,
                color: "#38BDF8",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              CARD META · TOURNAMENT REPORT
            </div>
          </div>
        </div>
      ),
      size
    );
  } catch (error) {
    console.error(
      "TOURNAMENT OG IMAGE ERROR:",
      error
    );

    return fallbackImage();
  }
}

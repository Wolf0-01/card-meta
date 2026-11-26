import { ImageResponse } from "next/og";
import sharp from "sharp";
import { findDeckByIdentifier } from "@/services/decks";

export const runtime = "nodejs";
export const alt = "Card Meta Deck Preview";
export const contentType = "image/png";

interface Props {
  params: Promise<{
    slug: string;
    identifier: string;
  }>;
}

const BANLIST_BADGE: Record<string, { label: string; bg: string }> = {
  forbidden: { label: "0", bg: "#dc2626" },
  limited1: { label: "1", bg: "#ef4444" },
  limited2: { label: "2", bg: "#f97316" },
  limited3: { label: "3", bg: "#eab308" },
};

async function fetchCardJpegDataUrl(
  primaryUrl: string | null,
  ygoproId: number | null
): Promise<string | null> {
  const candidates = [
    primaryUrl,
    ygoproId
      ? `https://ygoprodeck.com{ygoproId}.jpg`
      : null,
  ].filter((u): u is string => Boolean(u));

  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "CardMetaOG/1.0" },
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const rawBuffer = Buffer.from(await res.arrayBuffer());
      const jpegBuffer = await sharp(rawBuffer)
        .resize(168, 244, { fit: "cover" })
        .jpeg({ quality: 82 })
        .toBuffer();

      return `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
    } catch {
      continue;
    }
  }

  return null;
}

export default async function DeckOpenGraphImage({ params }: Props) {
  const { identifier } = await params;
  const deck = await findDeckByIdentifier(identifier, null);

  if (!deck) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#070D1F",
            color: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          Card Meta
        </div>
      ),
      { width: 600, height: 315 }
    );
  }

  const uniqueCards = new Map<
    number,
    { image: string | null; ygoproId: number | null }
  >();

  for (const item of deck.cards) {
    const cid = item.cardId ?? item.card.id;
    if (!uniqueCards.has(cid)) {
      uniqueCards.set(cid, {
        image: item.card.image ?? null,
        ygoproId: item.card.ygoproId ?? null,
      });
    }
  }

  const resolvedEntries = await Promise.all(
    Array.from(uniqueCards.entries()).map(async ([cardId, info]) => [
      cardId,
      await fetchCardJpegDataUrl(info.image, info.ygoproId),
    ] as const)
  );
  const imageMap = new Map<number, string | null>(resolvedEntries);

  const mainCards: Array<{
    key: string;
    src: string | null;
    name: string;
    banlistStatus: string | null;
  }> = [];

  const extraCards: Array<{
    key: string;
    src: string | null;
    name: string;
    banlistStatus: string | null;
  }> = [];

  for (const item of deck.cards) {
    const target = item.zone === "extra" ? extraCards : mainCards;
    const src = imageMap.get(item.cardId ?? item.card.id) ?? null;
    for (let copy = 0; copy < item.quantity; copy++) {
      target.push({
        key: `${item.id}-${copy}`,
        src,
        name: item.card.name,
        banlistStatus: item.card.banlistStatus ?? null,
      });
    }
  }

  const COLS = 5;
  const CARD_W = 84;
  const CARD_H = 122;
  const GAP = 6;
  const PAD = 14;

  const mainRows = Math.max(1, Math.ceil(mainCards.length / COLS));
  const extraRows =
    extraCards.length > 0 ? Math.ceil(extraCards.length / COLS) : 0;

  const width = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
  const headerHeight = 46;
  const extraHeaderHeight = extraRows > 0 ? 28 : 0;
  const height =
    PAD * 2 +
    headerHeight +
    mainRows * CARD_H +
    Math.max(0, mainRows - 1) * GAP +
    extraHeaderHeight +
    extraRows * CARD_H +
    Math.max(0, extraRows - 1) * GAP;

  const renderCard = (c: {
    key: string;
    src: string | null;
    name: string;
    banlistStatus: string | null;
  }) => {
    const badge = c.banlistStatus ? BANLIST_BADGE[c.banlistStatus] : undefined;
    return (
      <div
        key={c.key}
        style={{
          position: "relative",
          display: "flex",
          width: `${CARD_W}px`,
          height: `${CARD_H}px`,
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "#1e293b",
          alignItems: "center",
          justifyContent: "center",
          padding: c.src ? "0px" : "4px",
          textAlign: "center",
          fontSize: "9px",
          color: "#cbd5e1",
        }}
      >
        {c.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.src}
            alt=""
            width={CARD_W}
            height={CARD_H}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>{c.name}</span>
        )}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              backgroundColor: badge.bg,
              border: "2px solid #0f172a",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 900,
            }}
          >
            {badge.label}
          </div>
        )}
      </div>
    );
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#081229",
          padding: `${PAD}px`,
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "36px",
            marginBottom: "10px",
            padding: "0 12px",
            borderRadius: "8px",
            backgroundColor: "#0E2147",
            border: "1px solid rgba(56, 189, 248, 0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 800,
              color: "#e2e8f0",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#38bdf8",
              }}
            />
            <span>{deck.skill?.trim() || "No Skill"}</span>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#7dd3fc",
              letterSpacing: "1px",
            }}
          >
            CARD META
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: `${GAP}px`,
          }}
        >
          {mainCards.map(renderCard)}
        </div>

        {extraCards.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "20px",
                marginTop: "8px",
                marginBottom: "6px",
                padding: "0 6px",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "1.2px",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              <span>Extra Deck ({extraCards.length})</span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: `${GAP}px`,
              }}
            >
              {extraCards.map(renderCard)}
            </div>
          </>
        )}
      </div>
    ),
    { width, height }
  );
}

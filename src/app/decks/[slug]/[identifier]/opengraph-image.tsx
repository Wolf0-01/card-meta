import { ImageResponse } from "next/og";
import sharp from "sharp";
import { findDeckByIdentifier } from "@/services/decks";
import { calculateDeckGemEstimate } from "@/lib/decks/gemCalculator";

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

function formatCompactGems(gems: number): string {
  if (gems >= 1000) {
    return `${Math.round(gems / 1000)}k`;
  }
  return String(gems);
}

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
        .resize(300, 438, { fit: "cover" })
        .jpeg({ quality: 92 })
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
            fontSize: 42,
            fontWeight: 900,
          }}
        >
          Card Meta
        </div>
      ),
      { width: 800, height: 420 }
    );
  }

  const gemEstimate = await calculateDeckGemEstimate(deck);

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

  // Resolución HD estilo Duel Links Meta (5 columnas en Main, 1 sola fila en Extra)
  const COLS = 5;
  const CARD_W = 148;
  const CARD_H = 216;
  const GAP = 10;
  const PAD = 18;

  const innerWidth = COLS * CARD_W + (COLS - 1) * GAP;
  const width = PAD * 2 + innerWidth;

  const mainRows = Math.max(1, Math.ceil(mainCards.length / COLS));

  // Todas las cartas del Extra Deck caben en una sola tira horizontal abajo
  const extraCount = extraCards.length;
  const extraGap = extraCount > 0 ? 6 : 0;
  const extraCardW =
    extraCount > 0
      ? Math.floor((innerWidth - (extraCount - 1) * extraGap) / Math.max(extraCount, 8))
      : 0;
  const extraCardH = extraCount > 0 ? Math.round(extraCardW * 1.46) : 0;

  const headerHeight = 54;
  const extraSectionHeight = extraCount > 0 ? 14 + extraCardH : 0;

  const height =
    PAD * 2 +
    headerHeight +
    12 +
    mainRows * CARD_H +
    Math.max(0, mainRows - 1) * GAP +
    extraSectionHeight;

  const renderCard = (
    c: {
      key: string;
      src: string | null;
      name: string;
      banlistStatus: string | null;
    },
    cardWidth: number,
    cardHeight: number,
    badgeSize: number
  ) => {
    const badge = c.banlistStatus ? BANLIST_BADGE[c.banlistStatus] : undefined;
    return (
      <div
        key={c.key}
        style={{
          position: "relative",
          display: "flex",
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          borderRadius: "6px",
          overflow: "hidden",
          backgroundColor: "#1e293b",
          alignItems: "center",
          justifyContent: "center",
          padding: c.src ? "0px" : "6px",
          textAlign: "center",
          fontSize: "12px",
          color: "#cbd5e1",
        }}
      >
        {c.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.src}
            alt=""
            width={cardWidth}
            height={cardHeight}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>{c.name}</span>
        )}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: `${badgeSize}px`,
              height: `${badgeSize}px`,
              borderRadius: "9999px",
              backgroundColor: badge.bg,
              border: "2px solid #0f172a",
              color: "#ffffff",
              fontSize: `${Math.round(badgeSize * 0.56)}px`,
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
          backgroundColor: "#060D1E",
          padding: `${PAD}px`,
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Cabecera estilo Duel Links Meta: Gemas | Rombo + Skill | Total Main */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: `${headerHeight}px`,
            marginBottom: "12px",
            padding: "0 18px",
            borderRadius: "10px",
            backgroundColor: "#0D1E42",
            border: "1px solid rgba(56, 189, 248, 0.35)",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#93c5fd",
              minWidth: "70px",
            }}
          >
            {gemEstimate.maxGems > 0
              ? `💎 ${formatCompactGems(gemEstimate.maxGems)}`
              : "CARD META"}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "22px",
              fontWeight: 800,
              color: "#f8fafc",
            }}
          >
            <span
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: "#facc15",
                transform: "rotate(45deg)",
              }}
            />
            <span>{deck.skill?.trim() || "No Skill"}</span>
          </div>

          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#cbd5e1",
              minWidth: "70px",
              textAlign: "right",
            }}
          >
            {mainCards.length}
          </span>
        </div>

        {/* Cuadrícula Main Deck (5 columnas HD) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: `${GAP}px`,
          }}
        >
          {mainCards.map((c) => renderCard(c, CARD_W, CARD_H, 32))}
        </div>

        {/* Tira horizontal única del Extra Deck */}
        {extraCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: `${extraGap}px`,
              marginTop: "14px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            {extraCards.map((c) =>
              renderCard(c, extraCardW, extraCardH, 22)
            )}
          </div>
        )}
      </div>
    ),
    { width, height }
  );
}

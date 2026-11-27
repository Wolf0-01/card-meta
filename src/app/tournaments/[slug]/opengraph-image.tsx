import { ImageResponse } from "next/og";
import { getTournamentBySlug } from "@/lib/tournaments";
import { formatDate, formatNumber } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "Tournament Report | Card Meta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TournamentOgImage({ params }: Props) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#070D1F",
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

  const bannerUrl = tournament.bannerUrl?.trim() || null;

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
          backgroundColor: "#070D1F",
          padding: "56px",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.78,
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                backgroundColor: "rgba(251,191,36,0.18)",
                border: "1px solid rgba(251,191,36,0.45)",
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
            <span style={{ color: "#CBD5E1", fontSize: 22, fontWeight: 700 }}>
              {formatDate(tournament.date)} · {tournament.format} ·{" "}
              {formatNumber(tournament.players)} players
            </span>
          </div>

          <div
            style={{
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
}

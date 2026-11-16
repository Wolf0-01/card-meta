import {
  notFound,
  redirect,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CircleDot,
  Droplets,
  Flame,
  Mountain,
  Moon,
  Package,
  Shield,
  Sparkles,
  Sun,
  Swords,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import { getBanlistLabel } from "@/lib/banlist";

import {
  formatSetType,
  slugifySetName,
} from "@/lib/setSlug";

import {
  mapPrismaCard,
  mapPrismaCardPreview,
} from "@/lib/mappers/cardMapper";

import CardDetailImage from "@/components/cards/CardDetailImage";
import CardRelated from "@/components/cards/CardRelated";
import BanlistBadge from "@/components/cards/BanlistBadge";
import { CardArtworkProvider } from "@/components/cards/CardArtworkContext";
import CardArtworkGallery from "@/components/cards/CardArtworkGallery";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

interface CardPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface AttributeMeta {
  Icon: LucideIcon;

  classes: string;
}

const ATTRIBUTE_META: Record<
  string,
  AttributeMeta
> = {
  DARK: {
    Icon: Moon,

    classes:
      "border-violet-500/40 bg-violet-500/10 text-violet-300",
  },

  LIGHT: {
    Icon: Sun,

    classes:
      "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },

  EARTH: {
    Icon: Mountain,

    classes:
      "border-amber-700/50 bg-amber-700/15 text-amber-400",
  },

  WATER: {
    Icon: Droplets,

    classes:
      "border-sky-500/40 bg-sky-500/10 text-sky-300",
  },

  FIRE: {
    Icon: Flame,

    classes:
      "border-red-500/40 bg-red-500/10 text-red-300",
  },

  WIND: {
    Icon: Wind,

    classes:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },

  DIVINE: {
    Icon: Sparkles,

    classes:
      "border-orange-500/40 bg-orange-500/10 text-orange-300",
  },
};

const DATE_FORMATTER =
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });

function formatStat(
  value: number | null
): string {
  return value === null
    ? "?"
    : String(value);
}

export default async function CardDetailPage({
  params,
}: CardPageProps) {
  const { slug } = await params;

  let prismaCard =
    await prisma.card.findUnique({
      where: {
        slug,
      },
    });

  /*
   * Compatibilidad con enlaces antiguos basados en el ID
   * numérico: se resuelven y se redirigen al slug canónico.
   */
  if (
    !prismaCard &&
    /^\d+$/.test(slug)
  ) {
    prismaCard =
      await prisma.card.findUnique({
        where: {
          id: Number(slug),
        },
      });

    if (prismaCard) {
      redirect(`/cards/${prismaCard.slug}`);
    }
  }

  if (!prismaCard) {
    notFound();
  }

  const card =
    mapPrismaCard(prismaCard);

  const altArts =
    await prisma.cardAltArt.findMany({
      where: {
        cardId: prismaCard.id,
      },

      orderBy: [
        { isDefault: "desc" },
        { createdAt: "asc" },
      ],

      select: {
        id: true,
        dlmId: true,
        image: true,
        isDefault: true,
      },
    });

  const related: CardPreviewData[] =
    card.archetype
      ? (
          await prisma.card.findMany({
            where: {
              archetype:
                card.archetype,

              NOT: {
                id: card.id,
              },
            },

            select: {
              id: true,

              ygoproId: true,

              name: true,

              slug: true,

              format: true,

              image: true,

              type: true,

              frameType: true,

              attribute: true,

              race: true,

              rarity: true,

              banlistStatus: true,

              archetype: true,

              level: true,

              linkRating: true,

              linkMarkers: true,

              scale: true,

              attack: true,

              defense: true,

              description: true,
            },

            take: 12,

            orderBy: {
              name: "asc",
            },
          })
        ).map(mapPrismaCardPreview)
      : [];

  const rarity = normalizeRarity(
    card.rarity
  );

  const rarityStyle =
    RARITY_STYLES[rarity];

  const type = card.type ?? "";

  const lowerType = type.toLowerCase();

  const isMonster =
    lowerType.includes("monster") ||
    lowerType.includes("token");

  const isSpell =
    lowerType.includes("spell");

  const isTrap =
    lowerType.includes("trap");

  const isSkill =
    lowerType.includes("skill");

  const isLink =
    card.linkRating !== null ||
    lowerType.includes("link");

  const isXyz =
    lowerType.includes("xyz");

  const isPendulum =
    lowerType.includes("pendulum") ||
    card.scale !== null;

  const attributeKey =
    card.attribute?.toUpperCase() ??
    null;

  const attributeMeta =
    attributeKey
      ? ATTRIBUTE_META[attributeKey]
      : null;

  const TypeIcon: LucideIcon =
    attributeMeta?.Icon ??
    (isSpell
      ? Sparkles
      : isTrap
        ? Shield
        : isSkill
          ? Zap
          : CircleDot);

  const propertyClasses =
    attributeMeta?.classes ??
    (isSpell
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : isTrap
        ? "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300"
        : isSkill
          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
          : "border-slate-600/50 bg-slate-700/30 text-slate-300");

  const propertyLabel =
    attributeKey ??
    (isSpell
      ? "SPELL"
      : isTrap
        ? "TRAP"
        : isSkill
          ? "SKILL"
          : "CARD");

  const kindParts = [
    card.race,
    card.type,
  ].filter(
    (value): value is string =>
      Boolean(value)
  );

  const kindLabel =
    kindParts.length > 0
      ? `[${kindParts.join(" / ")}]`
      : "[Unclassified]";

  const levelLabel = isLink
    ? "LINK"
    : isXyz
      ? "RANK"
      : "LEVEL";

  const levelValue = isLink
    ? card.linkRating
    : card.level;

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        px-4
        py-8
        text-slate-100
        sm:px-6
        sm:py-10
      "
    >
      <CardArtworkProvider
        defaultImage={card.image}
        altArts={altArts}
      >
      <div
        className="
          mx-auto
          w-full
          max-w-4xl
          space-y-6
        "
      >
        <Link
          href="/cards"
          className="
            inline-flex
            items-center
            gap-1.5
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-500
            transition-colors
            hover:text-blue-300
          "
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to catalog
        </Link>

        <h1
          className="
            text-center
            text-3xl
            font-black
            leading-tight
            tracking-tight
            text-white
          "
        >
          {card.name}
        </h1>

        <article
          className="
            rounded-2xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-5
            shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]
            sm:p-6
          "
        >
          <div
            className="
              grid
              gap-6
              md:grid-cols-[auto_1fr]
            "
          >
            {/* Columna izquierda: imagen + rareza */}
            <div
              className="
                relative
                mx-auto
                w-[240px]
                max-w-full
                pt-3
                md:mx-0
              "
            >
              <div className="relative">
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-600/70
                    bg-slate-900
                    shadow-[0_18px_45px_-20px_rgba(0,0,0,0.9)]
                  "
                >
                  <span
                    aria-hidden
                    className={`
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      z-10
                      h-[3px]
                      ${rarityStyle.strip}
                      ${rarityStyle.glow}
                    `}
                  />

                  <CardDetailImage
                    ygoproId={card.ygoproId}
                    image={card.image}
                    name={card.name}
                  />

                  {card.banlistStatus && (
                    <span className="absolute left-2 top-2 z-20">
                      <BanlistBadge
                        status={card.banlistStatus}
                        size="lg"
                      />
                    </span>
                  )}
                </div>

                <span
                  className={`
                    absolute
                    -top-2
                    right-1.5
                    z-20
                    rounded-t-md
                    px-2
                    py-1
                    text-[11px]
                    font-black
                    leading-none
                    tracking-[0.14em]
                    ring-1
                    ring-white/30
                    ${rarityStyle.badge}
                  `}
                >
                  {rarity}
                </span>
              </div>
            </div>

            {/* Right column: card details and effect */}
            <div
              className="
                flex
                min-w-0
                flex-col
                gap-4
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-2
                "
              >
                <span
                  className={`
                    inline-flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    ${propertyClasses}
                  `}
                >
                  <TypeIcon className="h-4 w-4" />
                </span>

                <span
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-slate-300
                  "
                >
                  {propertyLabel}
                </span>

                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-400
                  "
                >
                  {kindLabel}
                </span>
              </div>

              <p
                className="
                  whitespace-pre-line
                  text-sm
                  leading-6
                  text-slate-300
                "
              >
                {card.description ??
                  "This card has no registered description."}
              </p>

              {isMonster && (
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-x-6
                    gap-y-3
                    border-t
                    border-slate-700/50
                    pt-4
                  "
                >
                  <span className="inline-flex items-baseline gap-1.5">
                    <Swords className="h-3.5 w-3.5 self-center text-rose-300/80" />

                    <span
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-slate-500
                      "
                    >
                      ATK
                    </span>

                    <span
                      className="
                        text-lg
                        font-black
                        leading-none
                        tabular-nums
                        text-white
                      "
                    >
                      / {formatStat(card.attack)}
                    </span>
                  </span>

                  {!isLink && (
                    <span className="inline-flex items-baseline gap-1.5">
                      <Shield className="h-3.5 w-3.5 self-center text-sky-300/80" />

                      <span
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.16em]
                          text-slate-500
                        "
                      >
                        DEF
                      </span>

                      <span
                        className="
                          text-lg
                          font-black
                          leading-none
                          tabular-nums
                          text-white
                        "
                      >
                        / {formatStat(card.defense)}
                      </span>
                    </span>
                  )}

                  {levelValue !== null && (
                    <span className="inline-flex items-baseline gap-1.5">
                      <span
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.16em]
                          text-slate-500
                        "
                      >
                        {levelLabel}
                      </span>

                      <span
                        className="
                          text-lg
                          font-black
                          leading-none
                          tabular-nums
                          text-white
                        "
                      >
                        / {levelValue}
                      </span>
                    </span>
                  )}

                  {isPendulum &&
                    card.scale !== null && (
                    <span className="inline-flex items-baseline gap-1.5">
                      <span
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.16em]
                          text-slate-500
                        "
                      >
                        SCALE
                      </span>

                      <span
                        className="
                          text-lg
                          font-black
                          leading-none
                          tabular-nums
                          text-white
                        "
                      >
                        / {card.scale}
                      </span>
                    </span>
                  )}
                </div>
              )}

              <div
                className="
                  mt-auto
                  rounded-xl
                  border
                  border-slate-700/50
                  bg-[#070D1F]/80
                  px-4
                  py-3
                "
              >
                <p
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-slate-500
                  "
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  How to Obtain
                </p>

                {card.obtain &&
                card.obtain.length > 0 ? (
                  <ul
                    className="
                      mt-2
                      flex
                      flex-wrap
                      gap-1.5
                    "
                  >
                    {card.obtain.map((entry) => (
                      <li
                        key={`${entry.type ?? "set"}-${entry.name}`}
                        className="max-w-full"
                      >
                        <Link
                          href={`/articles/sets/${slugifySetName(entry.name)}`}
                          title={`View the cards in ${entry.name}`}
                          className="
                            group
                            inline-flex
                            max-w-full
                            items-center
                            gap-1.5
                            rounded-md
                            border
                            border-slate-700/60
                            bg-[#0B132B]
                            px-2
                            py-1
                            text-[11px]
                            font-semibold
                            text-slate-200
                            transition-colors
                            hover:border-blue-400/70
                            hover:bg-blue-500/10
                            hover:text-white
                          "
                        >
                          <span className="truncate">
                            {entry.name}
                          </span>

                          {entry.type && (
                            <span
                              className="
                                shrink-0
                                text-[8px]
                                font-black
                                uppercase
                                tracking-[0.1em]
                                text-slate-500
                                transition-colors
                                group-hover:text-blue-200
                              "
                            >
                              {formatSetType(entry.type)}
                            </span>
                          )}

                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className="
                      mt-2
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      text-slate-300
                    "
                  >
                    <Package className="h-3.5 w-3.5 text-blue-300" />
                    Yu-Gi-Oh! Duel Links
                  </p>
                )}

                <div
                  className="
                    mt-2.5
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-1.5
                    border-t
                    border-slate-700/40
                    pt-2
                    text-[11px]
                    text-slate-400
                  "
                >
                  {card.archetype && (
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                      Arquetipo: {card.archetype}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-rose-300" />
                    Banlist:{" "}
                    {card.banlistStatus
                      ? getBanlistLabel(
                          card.banlistStatus
                        )
                      : "Unlimited"}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
                    {DATE_FORMATTER.format(
                      card.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <CardArtworkGallery cardName={card.name} />

        <CardRelated
          title="Related cards"
          cards={related}
        />
      </div>
      </CardArtworkProvider>
    </main>
  );
}

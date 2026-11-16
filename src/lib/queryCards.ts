import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { mapPrismaCard } from "@/lib/mappers/cardMapper";

import type { Card } from "@/types/card";

export interface QueryOptions {
  search?: string;

  slug?: string;

  /** Formato del catálogo. Por defecto, Speed Duel. */
  format?: string;

  type?: string;
  attribute?: string;
  monsterType?: string;

  level?: number;
  minLevel?: number;
  maxLevel?: number;

  scale?: number;

  linkMarkers?: Prisma.InputJsonValue;

  attack?: number;
  defense?: number;

  minAttack?: number;
  maxAttack?: number;

  minDefense?: number;
  maxDefense?: number;

  rarity?: string;
  archetype?: string;

  random?: boolean;

  sort?: string;
  direction?: "asc" | "desc";

  limit?: number;
  page?: number;
}

interface Pagination {
  pageSize: number;
  currentPage: number;
  skip: number;
}

function getPagination(
  page = 1,
  limit = 50
): Pagination {
  const pageSize = limit;

  const currentPage = Math.max(page, 1);

  return {
    pageSize,
    currentPage,
    skip: (currentPage - 1) * pageSize,
  };
}

function getOrderBy(
  random: boolean,
  sort = "popularity",
  direction: "asc" | "desc" = "asc"
): Prisma.CardOrderByWithRelationInput | undefined {
  if (random) {
    return undefined;
  }

  switch (sort) {
    case "attack":
      return { attack: direction };
    case "defense":
      return { defense: direction };
    case "level":
      return { level: direction };
    case "rarity":
      return { rarity: direction };
    case "newest":
      return { createdAt: "desc" };
    case "name":
      return { name: direction };
    default:
      /*
       * "Popularity" aún no existe como métrica en
       * la base de datos. Hasta que haya datos de uso
       * de mazos, se ordena alfabéticamente.
       */
      return { name: direction };
  }
}

function buildWhere(
  options: QueryOptions
): Prisma.CardWhereInput {
  const {
    search,
    slug,
    format,
    type,
    attribute,
    monsterType,

    level,
    minLevel,
    maxLevel,

    scale,
    linkMarkers,

    attack,
    defense,

    minAttack,
    maxAttack,

    minDefense,
    maxDefense,

    rarity,
    archetype,
  } = options;

  const where: Prisma.CardWhereInput = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (slug) {
    where.slug = slug;
  }

  where.format =
    format?.trim().toLowerCase() === "rush"
      ? "rush"
      : "speed";

  if (type) {
    where.type = {
      contains: type,
      mode: "insensitive",
    };
  }

  if (attribute) {
    where.attribute = attribute;
  }

  if (monsterType) {
    where.race = monsterType;
  }

  if (level !== undefined) {
    where.level = level;
  } else if (
    minLevel !== undefined ||
    maxLevel !== undefined
  ) {
    where.level = {
      ...(minLevel !== undefined && {
        gte: minLevel,
      }),
      ...(maxLevel !== undefined && {
        lte: maxLevel,
      }),
    };
  }

  if (scale !== undefined) {
    where.scale = scale;
  }

  if (linkMarkers) {
    where.linkMarkers = {
      array_contains: linkMarkers,
    };
  }

  if (attack !== undefined) {
    where.attack = attack;
  } else if (
    minAttack !== undefined ||
    maxAttack !== undefined
  ) {
    where.attack = {
      ...(minAttack !== undefined && {
        gte: minAttack,
      }),
      ...(maxAttack !== undefined && {
        lte: maxAttack,
      }),
    };
  }

  if (defense !== undefined) {
    where.defense = defense;
  } else if (
    minDefense !== undefined ||
    maxDefense !== undefined
  ) {
    where.defense = {
      ...(minDefense !== undefined && {
        gte: minDefense,
      }),
      ...(maxDefense !== undefined && {
        lte: maxDefense,
      }),
    };
  }

  if (rarity) {
    if (rarity.toUpperCase() === "N") {
      /*
       * Las cartas sin rareza oficial se muestran
       * como "N" en la interfaz. El filtro debe
       * incluirlas para que coincida con la vista.
       */
      where.OR = [
        { rarity: "N" },
        { rarity: null },
      ];
    } else {
      where.rarity = rarity;
    }
  }

  if (archetype) {
    where.archetype = {
      contains: archetype,
      mode: "insensitive",
    };
  }

  return where;
}

const cardSelect =
  Prisma.validator<Prisma.CardSelect>()({
    id: true,
    ygoproId: true,

    name: true,
    slug: true,

    format: true,

    obtain: true,

    type: true,
    race: true,
    attribute: true,

    rarity: true,

    banlistStatus: true,

    attack: true,
    defense: true,

    level: true,
    scale: true,

    frameType: true,

    linkRating: true,
    linkMarkers: true,

    archetype: true,

    image: true,
    description: true,

    createdAt: true,
    updatedAt: true,
  });

/**
 * Máximo de coincidencias que se ordenan en memoria para
 * priorizar los nombres exactos y los que empiezan por la
 * búsqueda. Por encima de este umbral se usa el orden de
 * la base de datos para no cargar demasiadas filas.
 */
const SEARCH_PRIORITY_MAX = 500;

function getSearchRank(
  name: string,
  search: string
): number {
  const normalizedName = name
    .trim()
    .toLowerCase();

  const needle = search
    .trim()
    .toLowerCase();

  if (!needle) {
    return 2;
  }

  if (normalizedName === needle) {
    return 0;
  }

  if (normalizedName.startsWith(needle)) {
    return 1;
  }

  return 2;
}

function shuffleCards<T>(
  cards: T[],
  limit: number
): T[] {
  const shuffled = [...cards];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled.slice(0, limit);
}

export async function queryCards(
  options: QueryOptions
) {
  const {
    random = false,
    limit = 50,
    page = 1,
    sort = "popularity",
    direction = "asc",
  } = options;

  const {
    pageSize,
    currentPage,
    skip,
  } = getPagination(page, limit);

  const where = buildWhere(options);

  const orderBy = getOrderBy(
    random,
    sort,
    direction
  );

  const total = await prisma.card.count({
    where,
  });

  const searchTerm = options.search?.trim() ?? "";

  /*
   * Las coincidencias exactas y las que empiezan por el
   * término se muestran primero, conservando el orden
   * elegido dentro de cada grupo. Se pagina en memoria
   * para que el orden sea consistente entre páginas.
   */
  if (
    !random &&
    searchTerm.length > 0 &&
    total > 0 &&
    total <= SEARCH_PRIORITY_MAX
  ) {
    const matching =
      await prisma.card.findMany({
        where,
        take: SEARCH_PRIORITY_MAX,
        orderBy,
        select: cardSelect,
      });

    const ordered = matching
      .map((card) => ({
        card,
        rank: getSearchRank(
          card.name,
          searchTerm
        ),
      }))
      .sort((a, b) => a.rank - b.rank)
      .map(({ card }) => card);

    const pageCards = ordered.slice(
      skip,
      skip + pageSize
    );

    return {
      cards: pageCards.map(mapPrismaCard),

      total,

      page: currentPage,

      pageSize,

      pages: Math.ceil(total / pageSize),
    };
  }

  const cards = await prisma.card.findMany({
    where,
    skip: random ? undefined : skip,
    take: pageSize,
    orderBy,
    select: cardSelect,
  });

  let finalCards: Card[] =
    cards.map(mapPrismaCard);

  if (random) {
    finalCards = shuffleCards(
      finalCards,
      limit
    );
  }

  return {
    cards: finalCards,

    total: random
      ? finalCards.length
      : total,

    page: currentPage,

    pageSize,

    pages: Math.ceil(total / pageSize),
  };
}
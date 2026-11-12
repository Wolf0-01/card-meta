import { prisma } from "@/lib/prisma";

import { slugifySetName } from "@/lib/setSlug";

import type { CardObtainEntry } from "@/types/card";
import type { MetaDeck } from "@/types/meta";

/**
 * Unidad que se repite al comprar una caja.
 *
 * - `vuelta`: la caja se puede reiniciar y vuelve a entregar
 *   las copias garantizadas de cada carta.
 * - `caja`: caja de selección con un número fijo de sobres.
 * - `compra`: deck de estructura; cada compra entrega una copia.
 */
export type GemBoxUnit = "vuelta" | "caja" | "compra";

export interface GemBoxCard {
  cardId: number;

  name: string;

  image: string | null;

  ygoproId: number | null;

  rarity: string | null;

  /** Copias que pide el mazo. */
  needed: number;

  /** Copias garantizadas de esta carta en una vuelta de la caja. */
  copiesPerCycle: number;
}

export interface GemBox {
  key: string;

  name: string;

  /** Tipo original que devuelve Duel Links Meta. */
  type: string;

  /** Etiqueta legible del tipo de caja. */
  typeLabel: string;

  slug: string;

  href: string;

  bannerUrl: string | null;

  releasedAt: string | null;

  unit: GemBoxUnit;

  /** Vueltas necesarias en el peor escenario (caja completa). */
  cycles: number;

  /** Vueltas esperadas de media. */
  averageCycles: number;

  /** Gemas por vuelta completa de la caja. */
  gemsPerCycle: number;

  maxGems: number;

  averageGems: number;

  cards: GemBoxCard[];

  note: string | null;
}

export interface GemFreeSource {
  name: string;

  type: string | null;
}

export interface GemFreeCard {
  cardId: number;

  name: string;

  image: string | null;

  ygoproId: number | null;

  rarity: string | null;

  needed: number;

  sources: GemFreeSource[];
}

export interface DeckGemEstimate {
  /** Coste máximo estimado en gemas (peor escenario). */
  maxGems: number;

  /** Coste promedio estimado en gemas. */
  averageGems: number;

  boxes: GemBox[];

  freeCards: GemFreeCard[];

  /** Copias totales del mazo (Main + Extra). */
  totalCopies: number;

  /** Copias que dependen de abrir cajas. */
  paidCopies: number;

  /** Copias obtenibles fuera de sobres. */
  freeCopies: number;

  /** Alguna carta no tiene datos de obtención en el catálogo. */
  hasUnknownSources: boolean;
}

interface BoxTypeConfig {
  label: string;

  /** Sobres que contiene una vuelta completa. */
  packs: number;

  gemsPerPack: number;

  gemsPerCycle: number;

  unit: GemBoxUnit;

  /** La caja entrega copias fijas; no hay aleatoriedad de posición. */
  deterministic: boolean;

  note: string | null;
}

/**
 * Costes reales de Duel Links.
 *
 * Main Box: 180 sobres × 50 gemas = 9,000 gemas por vuelta.
 * Mini Box: 100 sobres × 50 gemas = 5,000 gemas por vuelta.
 * Deck Build Box / Pickup Box: 50 sobres × 50 gemas = 2,500.
 * Selection Box: 60 sobres × 200 gemas = 12,000 por caja.
 * Selection Box Mini: 36 sobres × 200 = 7,200.
 * Selection Box Super Mini: 12 sobres × 200 = 2,400.
 * Structure Deck: 1,000 gemas por compra (se puede repetir).
 */
const BOX_TYPES: Record<string, BoxTypeConfig> = {
  "Main Box": {
    label: "Main Box",
    packs: 180,
    gemsPerPack: 50,
    gemsPerCycle: 9000,
    unit: "vuelta",
    deterministic: false,
    note: null,
  },

  "Mini Box": {
    label: "Mini Box",
    packs: 100,
    gemsPerPack: 50,
    gemsPerCycle: 5000,
    unit: "vuelta",
    deterministic: false,
    note: null,
  },

  "Deck Build Box": {
    label: "Deck Build Box",
    packs: 50,
    gemsPerPack: 50,
    gemsPerCycle: 2500,
    unit: "vuelta",
    deterministic: false,
    note: null,
  },

  "Pickup Box": {
    label: "Pickup Box",
    packs: 50,
    gemsPerPack: 50,
    gemsPerCycle: 2500,
    unit: "vuelta",
    deterministic: false,
    note: null,
  },

  "Selection Box": {
    label: "Selection Box",
    packs: 60,
    gemsPerPack: 200,
    gemsPerCycle: 12000,
    unit: "caja",
    deterministic: false,
    note: "Solo una parte de los sobres se puede comprar con gemas.",
  },

  "Selection Box Mini": {
    label: "Selection Box Mini",
    packs: 36,
    gemsPerPack: 200,
    gemsPerCycle: 7200,
    unit: "caja",
    deterministic: false,
    note: "Solo una parte de los sobres se puede comprar con gemas.",
  },

  "Selection Box Super Mini": {
    label: "Selection Box Super Mini",
    packs: 12,
    gemsPerPack: 200,
    gemsPerCycle: 2400,
    unit: "caja",
    deterministic: false,
    note: "Solo 5 sobres se pueden comprar con gemas.",
  },

  "Structure Deck": {
    label: "Structure Deck",
    packs: 1,
    gemsPerPack: 1000,
    gemsPerCycle: 1000,
    unit: "compra",
    deterministic: true,
    note: null,
  },

  "Structure Deck EX": {
    label: "Structure Deck EX",
    packs: 1,
    gemsPerPack: 1000,
    gemsPerCycle: 1000,
    unit: "compra",
    deterministic: true,
    note: null,
  },

  "Structure Deck Special": {
    label: "Structure Deck Special",
    packs: 1,
    gemsPerPack: 1000,
    gemsPerCycle: 1000,
    unit: "compra",
    deterministic: true,
    note: null,
  },

  "Starter Deck": {
    label: "Starter Deck",
    packs: 1,
    gemsPerPack: 500,
    gemsPerCycle: 500,
    unit: "compra",
    deterministic: true,
    note: null,
  },
};

interface ResolvedBoxType extends BoxTypeConfig {
  /** Clave canónica del tipo, p. ej. `Main Box`. */
  typeKey: string;
}

function normalizeToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const BOX_TYPE_INDEX = new Map<
  string,
  ResolvedBoxType
>(
  Object.entries(BOX_TYPES).map(
    ([typeKey, config]) => [
      normalizeToken(typeKey),
      {
        ...config,
        typeKey,
      },
    ]
  )
);

function resolveBoxType(
  type: string | null
): ResolvedBoxType | null {
  if (!type) {
    return null;
  }

  return (
    BOX_TYPE_INDEX.get(normalizeToken(type)) ??
    null
  );
}

function parseObtain(
  value: unknown
): CardObtainEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries: CardObtainEntry[] = [];

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const record = item as Record<
      string,
      unknown
    >;

    const name =
      typeof record.name === "string"
        ? record.name.trim()
        : "";

    if (!name) {
      continue;
    }

    entries.push({
      name,

      type:
        typeof record.type === "string"
          ? record.type.trim()
          : null,

      amount:
        typeof record.amount === "number" &&
        Number.isFinite(record.amount)
          ? record.amount
          : null,
    });
  }

  return entries;
}

interface PaidOption {
  entry: CardObtainEntry;

  boxType: ResolvedBoxType;

  copiesPerCycle: number;

  /** Gemas por copia necesaria; sirve para elegir la fuente más barata. */
  costPerCopy: number;
}

function getPaidOptions(
  entries: CardObtainEntry[]
): PaidOption[] {
  const options = new Map<
    string,
    PaidOption
  >();

  for (const entry of entries) {
    const boxType = resolveBoxType(
      entry.type
    );

    if (!boxType) {
      continue;
    }

    const copiesPerCycle = Math.max(
      entry.amount ?? 1,
      1
    );

    const option: PaidOption = {
      entry,

      boxType,

      copiesPerCycle,

      costPerCopy:
        boxType.gemsPerCycle /
        copiesPerCycle,
    };

    const key = `${normalizeToken(
      entry.name
    )}::${boxType.typeKey}`;

    const current = options.get(key);

    if (
      !current ||
      option.copiesPerCycle >
        current.copiesPerCycle
    ) {
      options.set(key, option);
    }
  }

  return [...options.values()];
}

/**
 * Vueltas esperadas para conseguir `needed` copias cuando cada
 * vuelta garantiza `perCycle` copias.
 *
 * Las copias están repartidas de forma uniforme dentro de la
 * caja, así que la última copia de una vuelta aparece, de media,
 * en la fracción `r / (k + 1)` de la caja.
 */
export function expectedCycles(
  needed: number,
  perCycle: number
): number {
  const k = Math.max(perCycle, 1);

  const full = Math.floor((needed - 1) / k);

  const remainder = needed - full * k;

  return full + remainder / (k + 1);
}

function roundGems(value: number): number {
  return Math.round(value);
}

interface BoxGroup {
  key: string;

  name: string;

  type: string;

  boxType: ResolvedBoxType;

  cards: GemBoxCard[];
}

/**
 * Calcula el desglose real de cajas y gemas de un mazo publicado.
 *
 * Estrategia:
 *
 * 1. Consulta el `obtain`, la rareza y la imagen de cada carta.
 * 2. Elige, por carta, la caja con menor coste por copia.
 * 3. Agrupa las cartas por caja y calcula las vueltas necesarias
 *    como el máximo de copias que exige cualquiera de sus cartas.
 * 4. Cruza cada caja con `SetMeta` para obtener el slug y el
 *    banner oficiales de la expansión.
 *
 * Las cartas sin ninguna fuente de caja (tickets, eventos,
 * personajes, Card Trader, etc.) se devuelven aparte y no suman
 * gemas.
 */
export async function calculateDeckGemEstimate(
  deck: Pick<MetaDeck, "cards">
): Promise<DeckGemEstimate> {
  const quantities = new Map<
    number,
    number
  >();

  for (const deckCard of deck.cards) {
    const id = deckCard.card.id;

    quantities.set(
      id,
      (quantities.get(id) ?? 0) +
        Math.max(deckCard.quantity ?? 1, 1)
    );
  }

  const totalCopies = [...quantities.values()].reduce(
    (total, quantity) => total + quantity,
    0
  );

  if (quantities.size === 0) {
    return {
      maxGems: 0,
      averageGems: 0,
      boxes: [],
      freeCards: [],
      totalCopies: 0,
      paidCopies: 0,
      freeCopies: 0,
      hasUnknownSources: false,
    };
  }

  const [cards, setMetas] = await Promise.all([
    prisma.card.findMany({
      where: {
        id: {
          in: [...quantities.keys()],
        },
      },

      select: {
        id: true,
        name: true,
        rarity: true,
        image: true,
        ygoproId: true,
        obtain: true,
      },
    }),

    prisma.setMeta.findMany({
      select: {
        name: true,
        slug: true,
        bannerUrl: true,
        releasedAt: true,
      },
    }),
  ]);

  const cardIndex = new Map(
    cards.map((card) => [card.id, card])
  );

  const setMetaIndex = new Map(
    setMetas.map((set) => [
      normalizeToken(set.name),
      set,
    ])
  );

  const boxGroups = new Map<
    string,
    BoxGroup
  >();

  const freeCards: GemFreeCard[] = [];

  let paidCopies = 0;

  let freeCopies = 0;

  let hasUnknownSources = false;

  for (const [cardId, needed] of quantities) {
    const card = cardIndex.get(cardId);

    if (!card) {
      hasUnknownSources = true;

      continue;
    }

    const entries = parseObtain(card.obtain);

    const paidOptions = getPaidOptions(entries);

    if (paidOptions.length === 0) {
      freeCopies += needed;

      if (entries.length === 0) {
        hasUnknownSources = true;
      }

      freeCards.push({
        cardId: card.id,

        name: card.name,

        image: card.image,

        ygoproId: card.ygoproId,

        rarity: card.rarity,

        needed,

        sources: entries.map((entry) => ({
          name: entry.name,

          type: entry.type,
        })),
      });

      continue;
    }

    paidCopies += needed;

    const best = paidOptions.reduce(
      (current, option) => {
        if (
          option.costPerCopy <
          current.costPerCopy
        ) {
          return option;
        }

        if (
          option.costPerCopy ===
            current.costPerCopy &&
          option.boxType.gemsPerCycle <
            current.boxType.gemsPerCycle
        ) {
          return option;
        }

        return current;
      }
    );

    const groupKey = `${normalizeToken(
      best.entry.name
    )}::${best.boxType.typeKey}`;

    const current = boxGroups.get(groupKey);

    const boxCard: GemBoxCard = {
      cardId: card.id,

      name: card.name,

      image: card.image,

      ygoproId: card.ygoproId,

      rarity: card.rarity,

      needed,

      copiesPerCycle: best.copiesPerCycle,
    };

    if (current) {
      current.cards.push(boxCard);

      continue;
    }

    boxGroups.set(groupKey, {
      key: groupKey,

      name: best.entry.name,

      type: best.boxType.typeKey,

      boxType: best.boxType,

      cards: [boxCard],
    });
  }

  const boxes: GemBox[] = [...boxGroups.values()]
    .map((group) => {
      const cycles = Math.max(
        ...group.cards.map((card) =>
          Math.ceil(
            card.needed /
              card.copiesPerCycle
          )
        )
      );

      const averageCycles =
        group.boxType.deterministic
          ? cycles
          : Math.max(
              ...group.cards.map((card) =>
                expectedCycles(
                  card.needed,
                  card.copiesPerCycle
                )
              )
            );

      const setMeta = setMetaIndex.get(
        normalizeToken(group.name)
      );

      const slug =
        setMeta?.slug ??
        slugifySetName(group.name);

      return {
        key: group.key,

        name: group.name,

        type: group.type,

        typeLabel: group.boxType.label,

        slug,

        href: `/articles/sets/${slug}`,

        bannerUrl: setMeta?.bannerUrl ?? null,

        releasedAt:
          setMeta?.releasedAt?.toISOString() ??
          null,

        unit: group.boxType.unit,

        cycles,

        averageCycles,

        gemsPerCycle:
          group.boxType.gemsPerCycle,

        maxGems:
          cycles * group.boxType.gemsPerCycle,

        averageGems: roundGems(
          averageCycles *
            group.boxType.gemsPerCycle
        ),

        cards: group.cards.sort(
          (a, b) =>
            b.needed - a.needed ||
            a.name.localeCompare(b.name)
        ),

        note: group.boxType.note,
      };
    })
    .sort(
      (a, b) =>
        b.maxGems - a.maxGems ||
        a.name.localeCompare(b.name)
    );

  freeCards.sort(
    (a, b) =>
      b.needed - a.needed ||
      a.name.localeCompare(b.name)
  );

  return {
    maxGems: boxes.reduce(
      (total, box) => total + box.maxGems,
      0
    ),

    averageGems: boxes.reduce(
      (total, box) => total + box.averageGems,
      0
    ),

    boxes,

    freeCards,

    totalCopies,

    paidCopies,

    freeCopies,

    hasUnknownSources,
  };
}

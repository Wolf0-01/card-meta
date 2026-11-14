export type NewsCategoryKey =
  | "updates"
  | "events"
  | "boxes"
  | "banlist";

export interface NewsCategoryDefinition {
  key: NewsCategoryKey;

  label: string;

  description: string;

  /** Clases completas para que Tailwind las detecte. */
  badgeClass: string;

  dotClass: string;

  glowClass: string;
}

export const NEWS_CATEGORIES: NewsCategoryDefinition[] = [
  {
    key: "updates",
    label: "Updates",
    description:
      "Game updates, balance changes and competitive news.",
    badgeClass:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    dotClass: "bg-emerald-300",
    glowClass:
      "from-emerald-400/25 via-emerald-500/10 to-transparent",
  },
  {
    key: "events",
    label: "Events",
    description:
      "Tournaments, campaigns and community events.",
    badgeClass:
      "border-sky-400/30 bg-sky-400/10 text-sky-200",
    dotClass: "bg-sky-300",
    glowClass:
      "from-sky-400/25 via-sky-500/10 to-transparent",
  },
  {
    key: "boxes",
    label: "Boxes",
    description:
      "Box reviews, reprints and release coverage.",
    badgeClass:
      "border-violet-400/30 bg-violet-400/10 text-violet-200",
    dotClass: "bg-violet-300",
    glowClass:
      "from-violet-400/25 via-violet-500/10 to-transparent",
  },
  {
    key: "banlist",
    label: "Banlist",
    description:
      "Banlist changes and their impact on the meta.",
    badgeClass:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
    dotClass: "bg-amber-300",
    glowClass:
      "from-amber-400/25 via-amber-500/10 to-transparent",
  },
];

const CATEGORY_BY_KEY = new Map(
  NEWS_CATEGORIES.map((category) => [
    category.key,
    category,
  ])
);

export function getNewsCategory(
  key: NewsCategoryKey
): NewsCategoryDefinition {
  return (
    CATEGORY_BY_KEY.get(key) ??
    NEWS_CATEGORIES[0]
  );
}

/**
 * Prisma devuelve el enum en mayúsculas. La interfaz
 * trabaja siempre con claves en minúsculas.
 */
export function newsCategoryKeyFromEnum(
  value: string
): NewsCategoryKey {
  const key = value.toLowerCase();

  return CATEGORY_BY_KEY.has(
    key as NewsCategoryKey
  )
    ? (key as NewsCategoryKey)
    : "updates";
}

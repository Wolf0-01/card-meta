export type NewsCategoryKey =
  | "leaks"
  | "guides"
  | "updates"
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
    key: "leaks",
    label: "Leaks",
    description:
      "Leaks, new boxes and cards before their release.",
    badgeClass:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
    dotClass: "bg-amber-300",
    glowClass:
      "from-amber-400/25 via-amber-500/10 to-transparent",
  },
  {
    key: "guides",
    label: "Guides",
    description:
      "Lines of play, ratios and tuning for every archetype.",
    badgeClass:
      "border-sky-400/30 bg-sky-400/10 text-sky-200",
    dotClass: "bg-sky-300",
    glowClass:
      "from-sky-400/25 via-sky-500/10 to-transparent",
  },
  {
    key: "updates",
    label: "Updates",
    description:
      "Results, meta shifts and game news.",
    badgeClass:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    dotClass: "bg-emerald-300",
    glowClass:
      "from-emerald-400/25 via-emerald-500/10 to-transparent",
  },
  {
    key: "banlist",
    label: "Banlist",
    description:
      "Hits, releases and their real impact on Speed Duel.",
    badgeClass:
      "border-rose-400/30 bg-rose-400/10 text-rose-200",
    dotClass: "bg-rose-300",
    glowClass:
      "from-rose-400/25 via-rose-500/10 to-transparent",
  },
];

export function getNewsCategory(
  key: NewsCategoryKey
): NewsCategoryDefinition {
  return (
    NEWS_CATEGORIES.find(
      (category) => category.key === key
    ) ?? NEWS_CATEGORIES[0]
  );
}

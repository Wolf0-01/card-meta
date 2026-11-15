export interface AvatarPreset {
  name: string;

  url: string;
}

/**
 * Set de avatares temáticos de Yu-Gi-Oh! tomados del arte
 * de cartas icónicas. Se usan como opciones rápidas en
 * /user/settings.
 */
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    name: "Dark Magician",
    url: "https://s3.duellinksmeta.com/cards/64d2a04dc80b440a3e87f876_w420.webp",
  },
  {
    name: "Blue-Eyes White Dragon",
    url: "https://s3.duellinksmeta.com/cards/6641c0c05c3ec02816bf4475_w420.webp",
  },
  {
    name: "Red-Eyes Black Dragon",
    url: "https://s3.duellinksmeta.com/cards/64d2a04dc80b440a3e87f872_w420.webp",
  },
  {
    name: "Cyber Dragon",
    url: "https://s3.duellinksmeta.com/cards/64d2a04dc80b440a3e87fd03_w420.webp",
  },
  {
    name: "Elemental HERO Neos",
    url: "https://s3.duellinksmeta.com/cards/66bb4971c4d2060b3630c00a_w420.webp",
  },
  {
    name: "Stardust Dragon",
    url: "/cards/44508094.jpg",
  },
];

export const DEFAULT_CARD_SORTS = [
  { value: "rarity", label: "Rarity" },
  { value: "name", label: "Name" },
  { value: "level", label: "Level" },
  { value: "attack", label: "ATK" },
] as const;

export type DefaultCardSort =
  (typeof DEFAULT_CARD_SORTS)[number]["value"];

export function isDefaultCardSort(
  value: string
): value is DefaultCardSort {
  return DEFAULT_CARD_SORTS.some(
    (option) => option.value === value
  );
}

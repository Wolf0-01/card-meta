export const CARD_TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "Monster", label: "Monsters" },
  { value: "Spell", label: "Spells" },
  { value: "Trap", label: "Traps" },
] as const;

export const CARD_ATTRIBUTE_OPTIONS = [
  { value: "", label: "Attribute" },
  { value: "DARK", label: "DARK" },
  { value: "LIGHT", label: "LIGHT" },
  { value: "EARTH", label: "EARTH" },
  { value: "WATER", label: "WATER" },
  { value: "FIRE", label: "FIRE" },
  { value: "WIND", label: "WIND" },
  { value: "DIVINE", label: "DIVINE" },
] as const;

export const CARD_RARITY_OPTIONS = [
  { value: "", label: "Rarity" },
  { value: "UR", label: "UR" },
  { value: "SR", label: "SR" },
  { value: "R", label: "R" },
  { value: "N", label: "N" },
] as const;

export const CARD_LEVEL_OPTIONS = [
  { value: "", label: "Level" },
  ...Array.from(
    { length: 12 },
    (_, index) => ({
      value: String(index + 1),
      label: `Level ${index + 1}`,
    })
  ),
];

export const CARD_SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "name", label: "Name (A-Z)" },
  { value: "attack", label: "ATK" },
  { value: "defense", label: "DEF" },
  { value: "level", label: "Level" },
] as const;

export type CardFilterKey =
  | "type"
  | "attribute"
  | "rarity"
  | "level";

export const CARD_CONTROL_CLASSES = `
  h-7
  rounded
  border
  border-slate-700/80
  bg-[#070D1F]
  px-1.5
  text-[10px]
  font-bold
  text-slate-300
  outline-none
  transition-colors
  hover:border-slate-600
  focus:border-blue-400
  focus:ring-2
  focus:ring-blue-500/20
`;

export const TIER_ENTRY_TIERS = [
  "TIER_1",
  "TIER_2",
  "TIER_3",
  "HIGH_POTENTIAL",
] as const;

export type TierEntryTier =
  (typeof TIER_ENTRY_TIERS)[number];

export const TIER_ENTRY_TIER_OPTIONS: {
  value: TierEntryTier;

  label: string;
}[] = [
  {
    value: "TIER_1",
    label: "Tier 1",
  },
  {
    value: "TIER_2",
    label: "Tier 2",
  },
  {
    value: "TIER_3",
    label: "Tier 3",
  },
  {
    value: "HIGH_POTENTIAL",
    label: "High Potential",
  },
];

export interface TierEntryEditorData {
  id: string;

  format: "speed" | "rush";

  tier: TierEntryTier;

  archetype: string;

  cardName: string | null;

  ygoproId: number | null;

  powerScore: number;

  notes: string | null;

  updatedAt: string;
}

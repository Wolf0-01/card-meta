export const CATALOG_TABS = [
  { value: "cards", label: "Cards" },
  { value: "skills", label: "Skills" },
  { value: "articles", label: "Articles" },
  { value: "other", label: "Other" },
] as const;

export type CatalogTab =
  (typeof CATALOG_TABS)[number]["value"];

export function isCatalogTab(
  value: string | undefined
): value is CatalogTab {
  return CATALOG_TABS.some(
    (tab) => tab.value === value
  );
}

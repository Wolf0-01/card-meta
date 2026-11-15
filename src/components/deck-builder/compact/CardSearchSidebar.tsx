"use client";

import {
  useEffect,
  useState,
} from "react";

import SkillCardTile from "@/components/cards/skills/SkillCardTile";

import type { DuelFormat } from "@/lib/duelFormat";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import type {
  Skill,
  SkillSearchResult,
} from "@/types/skill";

import {
  getDefaultDraftZone,
} from "@/lib/decks/draft";

import MiniCardTile from "./MiniCardTile";

const CARD_PAGE_SIZE = 30;

const SKILL_PAGE_SIZE = 8;

const TYPE_OPTIONS = [
  {
    value: "",
    label: "All",
  },
  {
    value: "Monster",
    label: "Monsters",
  },
  {
    value: "Spell",
    label: "Spells",
  },
  {
    value: "Trap",
    label: "Traps",
  },
] as const;

const ATTRIBUTE_OPTIONS = [
  {
    value: "",
    label: "Attribute",
  },
  {
    value: "DARK",
    label: "DARK",
  },
  {
    value: "LIGHT",
    label: "LIGHT",
  },
  {
    value: "EARTH",
    label: "EARTH",
  },
  {
    value: "WATER",
    label: "WATER",
  },
  {
    value: "FIRE",
    label: "FIRE",
  },
  {
    value: "WIND",
    label: "WIND",
  },
  {
    value: "DIVINE",
    label: "DIVINE",
  },
] as const;

type CatalogTab = "cards" | "skills";

interface CardsApiResponse {
  cards?: CardPreviewData[];

  total?: number;

  page?: number;

  pages?: number;
}

interface CardSearchSidebarProps {
  format: DuelFormat;

  onAddCard: (
    card: CardPreviewData,
    zone?: DeckZone
  ) => void;

  activeSkill?: string;

  onSelectSkill?: (skillName: string) => void;

  className?: string;
}

const fieldClasses = `
  w-full
  rounded-lg
  border
  border-border
  bg-surface
  px-2.5
  py-1.5
  text-xs
  text-foreground
  outline-none
  transition-colors
  placeholder:text-foreground-muted
  focus:border-primary
  focus:ring-2
  focus:ring-primary/20
`;

const tabButtonClasses = `
  rounded-md
  px-3
  py-1.5
  text-[11px]
  font-black
  uppercase
  tracking-wide
  transition-colors
`;

export default function CardSearchSidebar({
  format,
  onAddCard,
  activeSkill = "",
  onSelectSkill,
  className = "",
}: CardSearchSidebarProps) {
  const [tab, setTab] =
    useState<CatalogTab>("cards");

  const [search, setSearch] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [type, setType] = useState("");

  const [attribute, setAttribute] =
    useState("");

  const [page, setPage] = useState(1);

  const [cards, setCards] = useState<
    CardPreviewData[]
  >([]);

  const [total, setTotal] = useState(0);

  const [pages, setPages] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [skillSearch, setSkillSearch] =
    useState("");

  const [
    debouncedSkillSearch,
    setDebouncedSkillSearch,
  ] = useState("");

  const [skillCharacter, setSkillCharacter] =
    useState("");

  const [skillPage, setSkillPage] =
    useState(1);

  const [skills, setSkills] = useState<
    Skill[]
  >([]);

  const [skillTotal, setSkillTotal] =
    useState(0);

  const [skillPages, setSkillPages] =
    useState(1);

  const [
    skillCharacters,
    setSkillCharacters,
  ] = useState<string[]>([]);

  const [
    skillsLoading,
    setSkillsLoading,
  ] = useState(false);

  const [skillError, setSkillError] =
    useState<string | null>(null);

  /*
   * Ajuste de estado al cambiar el formato: se vuelve a la
   * primera página y, en Rush, se abandona la pestaña de
   * Skills. Se hace durante el render (patrón recomendado
   * por React) para evitar efectos en cascada.
   */
  const [previousFormat, setPreviousFormat] =
    useState(format);

  if (previousFormat !== format) {
    setPreviousFormat(format);

    setPage(1);

    if (format === "rush" && tab === "skills") {
      setTab("cards");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSkillSearch(
        skillSearch.trim()
      );

      setSkillPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [skillSearch]);

  useEffect(() => {
    if (tab !== "cards") {
      return;
    }

    const controller = new AbortController();

    async function loadCards() {
      setLoading(true);

      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(CARD_PAGE_SIZE),

          page: String(page),

          format,
        });

        if (debouncedSearch) {
          params.set(
            "search",
            debouncedSearch
          );
        }

        if (type) {
          params.set("type", type);
        }

        if (attribute) {
          params.set(
            "attribute",
            attribute
          );
        }

        const response = await fetch(
          `/api/cards?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load the cards."
          );
        }

        const data =
          (await response.json()) as CardsApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        setCards(
          Array.isArray(data.cards)
            ? data.cards
            : []
        );

        setTotal(data.total ?? 0);

        setPages(
          Math.max(data.pages ?? 1, 1)
        );
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setCards([]);

        setTotal(0);

        setPages(1);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the cards."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      controller.abort();
    };
  }, [
    tab,
    debouncedSearch,
    type,
    attribute,
    format,
    page,
  ]);

  useEffect(() => {
    if (tab !== "skills") {
      return;
    }

    const controller = new AbortController();

    async function loadSkills() {
      setSkillsLoading(true);

      setSkillError(null);

      try {
        const params = new URLSearchParams({
          limit: String(SKILL_PAGE_SIZE),

          page: String(skillPage),
        });

        if (debouncedSkillSearch) {
          params.set(
            "search",
            debouncedSkillSearch
          );
        }

        if (skillCharacter) {
          params.set(
            "character",
            skillCharacter
          );
        }

        const response = await fetch(
          `/api/skills?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load the skills."
          );
        }

        const data =
          (await response.json()) as SkillSearchResult;

        if (controller.signal.aborted) {
          return;
        }

        setSkills(
          Array.isArray(data.skills)
            ? data.skills
            : []
        );

        setSkillTotal(data.total ?? 0);

        setSkillPages(
          Math.max(data.pages ?? 1, 1)
        );

        setSkillCharacters(
          Array.isArray(data.characters)
            ? data.characters
            : []
        );
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setSkills([]);

        setSkillTotal(0);

        setSkillPages(1);

        setSkillError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the skills."
        );
      } finally {
        if (!controller.signal.aborted) {
          setSkillsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      controller.abort();
    };
  }, [
    tab,
    debouncedSkillSearch,
    skillCharacter,
    skillPage,
  ]);

  const isCardsTab = tab === "cards";

  const currentPage = isCardsTab
    ? page
    : skillPage;

  const currentPages = isCardsTab
    ? pages
    : skillPages;

  const currentLoading = isCardsTab
    ? loading
    : skillsLoading;

  const canGoBack = currentPage > 1;

  const canGoForward =
    currentPage < currentPages;

  const assignedSkillName =
    activeSkill.trim().toLowerCase();

  function goToPreviousPage() {
    if (isCardsTab) {
      setPage((current) =>
        Math.max(current - 1, 1)
      );

      return;
    }

    setSkillPage((current) =>
      Math.max(current - 1, 1)
    );
  }

  function goToNextPage() {
    if (isCardsTab) {
      setPage((current) =>
        Math.min(current + 1, pages)
      );

      return;
    }

    setSkillPage((current) =>
      Math.min(current + 1, skillPages)
    );
  }

  return (
    <aside
      className={`
        flex
        min-h-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background-secondary
        ${className}
      `}
    >
      <header className="space-y-2 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-foreground">
            Catalog{" "}
            <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
              {format === "rush" ? "Rush" : "Speed"}
            </span>
          </h2>

          <span className="text-[10px] font-semibold text-foreground-muted">
            {isCardsTab
              ? "Click to add"
              : "Click to assign"}
          </span>
        </div>

        <div
          className={`
            grid
            gap-1
            rounded-lg
            border
            border-border
            bg-surface
            p-1
            ${
              format === "rush"
                ? "grid-cols-1"
                : "grid-cols-2"
            }
          `}
        >
          <button
            type="button"
            onClick={() => setTab("cards")}
            className={`
              ${tabButtonClasses}
              ${
                isCardsTab
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }
            `}
          >
            Cards
          </button>

          {format !== "rush" && (
            <button
              type="button"
              onClick={() => setTab("skills")}
              className={`
                ${tabButtonClasses}
                ${
                  !isCardsTab
                    ? "bg-primary text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }
              `}
            >
              Skills
            </button>
          )}
        </div>

        {isCardsTab ? (
          <>
            <div className="relative">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Card name..."
                className={`${fieldClasses} pr-8`}
                maxLength={80}
                aria-label="Search cards by name"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-1.5
                    top-1/2
                    flex
                    h-5
                    w-5
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-surface-hover
                    text-[11px]
                    text-foreground-muted
                    transition-colors
                    hover:text-foreground
                  "
                >
                  ×
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value);

                  setPage(1);
                }}
                className={fieldClasses}
                aria-label="Filter by card type"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={attribute}
                onChange={(event) => {
                  setAttribute(
                    event.target.value
                  );

                  setPage(1);
                }}
                className={fieldClasses}
                aria-label="Filter by attribute"
              >
                {ATTRIBUTE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-center justify-between text-[10px] text-foreground-muted">
              <span>
                {loading
                  ? "Searching..."
                  : `${total.toLocaleString(
                      "en-US"
                    )} cards`}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSearch("");

                  setType("");

                  setAttribute("");

                  setPage(1);
                }}
                className="
                  font-semibold
                  text-foreground-muted
                  transition-colors
                  hover:text-primary
                "
              >
                Reset filters
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <input
                value={skillSearch}
                onChange={(event) =>
                  setSkillSearch(
                    event.target.value
                  )
                }
                placeholder="Search skill..."
                className={`${fieldClasses} pr-8`}
                maxLength={80}
                aria-label="Search skills by name or effect"
              />

              {skillSearch && (
                <button
                  type="button"
                  aria-label="Clear skill search"
                  onClick={() =>
                    setSkillSearch("")
                  }
                  className="
                    absolute
                    right-1.5
                    top-1/2
                    flex
                    h-5
                    w-5
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-surface-hover
                    text-[11px]
                    text-foreground-muted
                    transition-colors
                    hover:text-foreground
                  "
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={skillCharacter}
              onChange={(event) => {
                setSkillCharacter(
                  event.target.value
                );

                setSkillPage(1);
              }}
              className={fieldClasses}
              aria-label="Filter skills by character"
            >
              <option value="">
                All characters
              </option>

              {skillCharacters.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-[10px] text-foreground-muted">
              <span>
                {skillsLoading
                  ? "Searching..."
                  : `${skillTotal.toLocaleString(
                      "en-US"
                    )} skills`}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSkillSearch("");

                  setSkillCharacter("");

                  setSkillPage(1);
                }}
                className="
                  font-semibold
                  text-foreground-muted
                  transition-colors
                  hover:text-primary
                "
              >
                Reset filters
              </button>
            </div>
          </>
        )}
      </header>

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          p-2.5
        "
      >
        {isCardsTab ? (
          <>
            {error && (
              <p
                role="alert"
                className="
                  rounded-lg
                  border
                  border-red-500/40
                  bg-red-500/10
                  p-2
                  text-[11px]
                  text-red-200
                "
              >
                {error}
              </p>
            )}

            {!error &&
              cards.length === 0 &&
              !loading && (
                <div
                  className="
                    flex
                    h-full
                    min-h-[140px]
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    rounded-lg
                    border
                    border-dashed
                    border-border
                    p-4
                    text-center
                    text-[11px]
                    text-foreground-muted
                  "
                >
                  <span className="text-2xl">
                    🔎
                  </span>

                  <p>
                    No cards found
                    with these filters.
                  </p>
                </div>
              )}

            {cards.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-[repeat(auto-fill,minmax(88px,1fr))]
                  gap-2
                "
              >
                {cards.map((card) => (
                  <MiniCardTile
                    key={card.id}
                    card={card}
                    onClick={() =>
                      onAddCard(
                        card,
                        format === "rush"
                          ? "main"
                          : getDefaultDraftZone(
                              card
                            )
                      )
                    }
                  />
                ))}
              </div>
            )}

            {loading && cards.length > 0 && (
              <p className="py-2 text-center text-[10px] text-foreground-muted">
                Updating results...
              </p>
            )}
          </>
        ) : (
          <>
            {skillError && (
              <p
                role="alert"
                className="
                  rounded-lg
                  border
                  border-red-500/40
                  bg-red-500/10
                  p-2
                  text-[11px]
                  text-red-200
                "
              >
                {skillError}
              </p>
            )}

            {!skillError &&
              skills.length === 0 &&
              !skillsLoading && (
                <div
                  className="
                    flex
                    h-full
                    min-h-[140px]
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    rounded-lg
                    border
                    border-dashed
                    border-border
                    p-4
                    text-center
                    text-[11px]
                    text-foreground-muted
                  "
                >
                  <span className="text-2xl">
                    ⚡
                  </span>

                  <p>
                    No skills found
                    with these
                    filters.
                  </p>
                </div>
              )}

            {skills.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {skills.map((skill) => (
                  <SkillCardTile
                    key={skill.id}
                    skill={skill}
                    assigned={
                      assignedSkillName.length >
                        0 &&
                      assignedSkillName ===
                        skill.name
                          .trim()
                          .toLowerCase()
                    }
                    onAssign={(selected) =>
                      onSelectSkill?.(
                        selected.name
                      )
                    }
                  />
                ))}
              </div>
            )}

            {skillsLoading &&
              skills.length > 0 && (
                <p className="py-2 text-center text-[10px] text-foreground-muted">
                  Updating skills...
                </p>
              )}
          </>
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border p-2.5">
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={!canGoBack || currentLoading}
          className="
            rounded-md
            border
            border-border
            px-2.5
            py-1
            text-xs
            font-semibold
            text-foreground-secondary
            transition-colors
            hover:border-primary
            hover:text-foreground
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          ←
        </button>

        <span className="text-[10px] font-semibold text-foreground-muted">
          Page {currentPage} of{" "}
          {currentPages}
        </span>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={
            !canGoForward || currentLoading
          }
          className="
            rounded-md
            border
            border-border
            px-2.5
            py-1
            text-xs
            font-semibold
            text-foreground-secondary
            transition-colors
            hover:border-primary
            hover:text-foreground
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          →
        </button>
      </footer>
    </aside>
  );
}

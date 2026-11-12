"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  usePathname,
} from "next/navigation";

import {
  Search,
} from "lucide-react";

import CatalogGrid from "@/components/cards/CatalogGrid";

import CatalogHeader from "@/components/cards/CatalogHeader";

import type {
  CatalogTab,
} from "@/components/cards/catalogTabs";

import SkillsGrid from "@/components/cards/skills/SkillsGrid";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import type {
  Skill,
} from "@/types/skill";

import GlobalCatalogControls from "./GlobalCatalogControls";

import GlobalPagination from "./GlobalPagination";

import GlobalSkillsControls from "./GlobalSkillsControls";

import type {
  CardFilterKey,
} from "./cardFilterOptions";

const GLOBAL_TABS: ReadonlyArray<{
  value: CatalogTab;
  label: string;
}> = [
  { value: "cards", label: "Cards" },
  { value: "skills", label: "Skills" },
];

const CARDS_PAGE_SIZE = 25;

const SKILLS_PAGE_SIZE = 18;

const SEARCH_DEBOUNCE_MS = 300;

interface CardsResponse {
  cards?: CardPreviewData[];

  total?: number;

  page?: number;

  pages?: number;

  error?: string;
}

interface SkillsResponse {
  skills?: Skill[];

  total?: number;

  page?: number;

  pages?: number;

  characters?: string[];

  error?: string;
}

function isEditableTarget(
  target: EventTarget | null
) {
  const element =
    target instanceof HTMLElement
      ? target
      : null;

  if (!element) {
    return false;
  }

  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  );
}

function CardGridSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-5 gap-2"
    >
      {Array.from({ length: 15 }).map(
        (_, index) => (
          <div
            key={index}
            className="
              aspect-[59/86]
              animate-pulse
              rounded-lg
              border
              border-slate-700/60
              bg-slate-800/60
            "
          />
        )
      )}
    </div>
  );
}

function SkillsSkeleton() {
  return (
    <div aria-hidden className="space-y-2">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="
              h-20
              animate-pulse
              rounded-lg
              border
              border-slate-700/60
              bg-slate-800/40
            "
          />
        )
      )}
    </div>
  );
}

export default function GlobalCardSearch() {
  const pathname = usePathname();

  const previousPathname =
    useRef(pathname);

  const resultsRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] =
    useState(false);

  const [tab, setTab] =
    useState<CatalogTab>("cards");

  /* ----------------------------- Cartas ----------------------------- */

  const [cardSearchInput, setCardSearchInput] =
    useState("");

  const [cardSearch, setCardSearch] =
    useState("");

  const [cardType, setCardType] =
    useState("");

  const [cardAttribute, setCardAttribute] =
    useState("");

  const [cardRarity, setCardRarity] =
    useState("");

  const [cardLevel, setCardLevel] =
    useState("");

  const [cardSort, setCardSort] =
    useState("popularity");

  const [cardDirection, setCardDirection] =
    useState<"asc" | "desc">("asc");

  const [cardPage, setCardPage] =
    useState(1);

  const [cards, setCards] =
    useState<CardPreviewData[]>([]);

  const [cardTotal, setCardTotal] =
    useState(0);

  const [cardPages, setCardPages] =
    useState(1);

  const [cardsLoading, setCardsLoading] =
    useState(false);

  const [cardsError, setCardsError] =
    useState<string | null>(null);

  const [cardReloadToken, setCardReloadToken] =
    useState(0);

  /* ----------------------------- Skills ----------------------------- */

  const [skillSearchInput, setSkillSearchInput] =
    useState("");

  const [skillSearch, setSkillSearch] =
    useState("");

  const [skillCharacter, setSkillCharacter] =
    useState("");

  const [skillPage, setSkillPage] =
    useState(1);

  const [skills, setSkills] =
    useState<Skill[]>([]);

  const [skillTotal, setSkillTotal] =
    useState(0);

  const [skillPages, setSkillPages] =
    useState(1);

  const [characters, setCharacters] =
    useState<string[]>([]);

  const [skillsLoading, setSkillsLoading] =
    useState(false);

  const [skillsError, setSkillsError] =
    useState<string | null>(null);

  const [skillReloadToken, setSkillReloadToken] =
    useState(0);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  /*
   * Debounce del término de búsqueda. Al cambiar la
   * consulta se vuelve siempre a la primera página.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = cardSearchInput.trim();

      setCardSearch((current) =>
        current === next ? current : next
      );

      setCardPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [cardSearchInput]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = skillSearchInput.trim();

      setSkillSearch((current) =>
        current === next ? current : next
      );

      setSkillPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [skillSearchInput]);

  /*
   * Cierre al cambiar de ruta: si el usuario navega
   * desde un resultado, el modal no queda flotando
   * sobre la página nueva.
   */
  useEffect(() => {
    if (
      previousPathname.current !== pathname
    ) {
      previousPathname.current = pathname;

      setOpen(false);
    }
  }, [pathname]);

  /*
   * La portada y otros accesos pueden abrir el buscador
   * sin navegar mediante un evento global.
   */
  useEffect(() => {
    function handleOpenRequest() {
      setOpen(true);
    }

    window.addEventListener(
      "card-meta:open-search",
      handleOpenRequest
    );

    return () => {
      window.removeEventListener(
        "card-meta:open-search",
        handleOpenRequest
      );
    };
  }, []);

  /*
   * Atajos globales:
   * - Ctrl/Cmd + K alterna el buscador.
   * - "/" lo abre cuando no se está escribiendo.
   */
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      const typing = isEditableTarget(
        event.target
      );

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        if (typing) {
          return;
        }

        event.preventDefault();

        setOpen((current) => !current);

        return;
      }

      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        if (typing || open) {
          return;
        }

        event.preventDefault();

        setOpen(true);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  /*
   * Escape cierra el modal, salvo que haya un popover
   * de filtros abierto: en ese caso el popover se
   * encarga de cerrarse primero.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key !== "Escape") {
        return;
      }

      if (
        document.querySelector(
          "[data-global-filter-popover='true']"
        )
      ) {
        return;
      }

      event.preventDefault();

      setOpen(false);
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  /*
   * Bloquea el scroll de la página mientras el modal
   * está abierto, restaurando el valor previo.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* ------------------------ Carga de cartas ------------------------ */

  useEffect(() => {
    if (!open || tab !== "cards") {
      return;
    }

    const controller = new AbortController();

    const params = new URLSearchParams();

    if (cardSearch) {
      params.set("search", cardSearch);
    }

    if (cardType) {
      params.set("type", cardType);
    }

    if (cardAttribute) {
      params.set(
        "attribute",
        cardAttribute
      );
    }

    if (cardRarity) {
      params.set("rarity", cardRarity);
    }

    if (cardLevel) {
      params.set("level", cardLevel);
    }

    params.set("sort", cardSort);

    params.set("direction", cardDirection);

    params.set("page", String(cardPage));

    params.set(
      "limit",
      String(CARDS_PAGE_SIZE)
    );

    async function loadCards() {
      setCardsLoading(true);

      setCardsError(null);

      try {
        const response = await fetch(
          `/api/cards?${params.toString()}`,
          {
            signal: controller.signal,

            cache: "no-store",
          }
        );

        const data = (await response
          .json()
          .catch(() => null)) as
          | CardsResponse
          | null;

        if (!response.ok) {
          throw new Error(
            data?.error ??
              "No se pudieron cargar las cartas."
          );
        }

        if (controller.signal.aborted) {
          return;
        }

        setCards(data?.cards ?? []);

        setCardTotal(data?.total ?? 0);

        setCardPages(
          Math.max(data?.pages ?? 1, 1)
        );

        if (typeof data?.page === "number") {
          setCardPage((current) =>
            current === data.page
              ? current
              : (data.page as number)
          );
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setCards([]);

        setCardTotal(0);

        setCardPages(1);

        setCardsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las cartas."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCardsLoading(false);
        }
      }
    }

    void loadCards();

    return () => controller.abort();
  }, [
    open,
    tab,
    cardSearch,
    cardType,
    cardAttribute,
    cardRarity,
    cardLevel,
    cardSort,
    cardDirection,
    cardPage,
    cardReloadToken,
  ]);

  /* ------------------------ Carga de skills ------------------------ */

  useEffect(() => {
    if (!open || tab !== "skills") {
      return;
    }

    const controller = new AbortController();

    const params = new URLSearchParams();

    if (skillSearch) {
      params.set("search", skillSearch);
    }

    if (skillCharacter) {
      params.set(
        "character",
        skillCharacter
      );
    }

    params.set("page", String(skillPage));

    params.set(
      "limit",
      String(SKILLS_PAGE_SIZE)
    );

    async function loadSkills() {
      setSkillsLoading(true);

      setSkillsError(null);

      try {
        const response = await fetch(
          `/api/skills?${params.toString()}`,
          {
            signal: controller.signal,

            cache: "no-store",
          }
        );

        const data = (await response
          .json()
          .catch(() => null)) as
          | SkillsResponse
          | null;

        if (!response.ok) {
          throw new Error(
            data?.error ??
              "No se pudieron cargar las habilidades."
          );
        }

        if (controller.signal.aborted) {
          return;
        }

        setSkills(data?.skills ?? []);

        setSkillTotal(data?.total ?? 0);

        setSkillPages(
          Math.max(data?.pages ?? 1, 1)
        );

        if (
          Array.isArray(data?.characters) &&
          data.characters.length > 0
        ) {
          setCharacters(data.characters);
        }

        if (typeof data?.page === "number") {
          setSkillPage((current) =>
            current === data.page
              ? current
              : (data.page as number)
          );
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setSkills([]);

        setSkillTotal(0);

        setSkillPages(1);

        setSkillsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las habilidades."
        );
      } finally {
        if (!controller.signal.aborted) {
          setSkillsLoading(false);
        }
      }
    }

    void loadSkills();

    return () => controller.abort();
  }, [
    open,
    tab,
    skillSearch,
    skillCharacter,
    skillPage,
    skillReloadToken,
  ]);

  function scrollResultsToTop() {
    resultsRef.current?.scrollTo({
      top: 0,
    });
  }

  function handleCardFilterChange(
    key: CardFilterKey,
    value: string
  ) {
    setCardPage(1);

    switch (key) {
      case "type":
        setCardType(value);
        break;

      case "attribute":
        setCardAttribute(value);
        break;

      case "rarity":
        setCardRarity(value);
        break;

      case "level":
        setCardLevel(value);
        break;
    }
  }

  function resetCardFilters() {
    setCardSearchInput("");

    setCardSearch("");

    setCardType("");

    setCardAttribute("");

    setCardRarity("");

    setCardLevel("");

    setCardSort("popularity");

    setCardDirection("asc");

    setCardPage(1);
  }

  function resetSkills() {
    setSkillSearchInput("");

    setSkillSearch("");

    setSkillCharacter("");

    setSkillPage(1);
  }

  const cardLoading =
    cardsLoading && cards.length === 0;

  const skillLoading =
    skillsLoading && skills.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir buscador de cartas y habilidades"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Control+K"
        title="Buscar cartas y skills (Ctrl+K)"
        className="
          group
          inline-flex
          h-9
          shrink-0
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-border
          bg-surface
          px-2.5
          text-sm
          text-foreground-muted
          transition-colors
          hover:border-primary/50
          hover:text-foreground
          focus:outline-none
          focus:ring-2
          focus:ring-primary/30
        "
      >
        <Search className="h-4 w-4 shrink-0" />

        <span className="hidden sm:inline md:hidden lg:inline">
          Search cards...
        </span>

        <kbd
          className="
            ml-2
            hidden
            items-center
            rounded
            border
            border-border
            bg-background
            px-1.5
            py-0.5
            font-sans
            text-[10px]
            font-semibold
            text-foreground-muted
            lg:inline-flex
          "
        >
          Ctrl K
        </kbd>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscador global de cartas y habilidades"
            data-global-search-modal="true"
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                close();
              }
            }}
            className="
              fixed
              inset-0
              z-[90]
              flex
              items-center
              justify-center
              overflow-hidden
              bg-[#050914]/80
              p-3
              text-slate-100
              backdrop-blur-md
            "
          >
            <section
              className="
                relative
                flex
                h-[85vh]
                max-h-[85vh]
                w-full
                max-w-[540px]
                flex-col
                overflow-hidden
                rounded-xl
                border
                border-slate-700/70
                bg-[#0B132B]
                shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)]
                ring-1
                ring-white/5
              "
            >
              <CatalogHeader
                activeTab={tab}
                tabs={GLOBAL_TABS}
                onTabChange={setTab}
                onClose={close}
              />

              {tab === "cards" ? (
                <>
                  <GlobalCatalogControls
                    search={cardSearchInput}
                    type={cardType}
                    attribute={cardAttribute}
                    rarity={cardRarity}
                    level={cardLevel}
                    sort={cardSort}
                    direction={cardDirection}
                    onSearchChange={
                      setCardSearchInput
                    }
                    onFilterChange={
                      handleCardFilterChange
                    }
                    onSortChange={(value) => {
                      setCardSort(value);

                      setCardPage(1);
                    }}
                    onDirectionToggle={() => {
                      setCardDirection(
                        (current) =>
                          current === "asc"
                            ? "desc"
                            : "asc"
                      );

                      setCardPage(1);
                    }}
                    onReset={resetCardFilters}
                    autoFocus
                  />

                  {cardsLoading && (
                    <div
                      aria-hidden
                      className="
                        h-0.5
                        w-full
                        shrink-0
                        animate-pulse
                        bg-blue-500/80
                      "
                    />
                  )}

                  <div
                    ref={resultsRef}
                    aria-busy={cardsLoading}
                    className="
                      min-h-0
                      flex-1
                      overflow-y-auto
                      overscroll-contain
                      px-2.5
                      py-2
                      sm:px-3
                    "
                  >
                    {cardsError ? (
                      <div
                        role="alert"
                        className="
                          flex
                          min-h-[200px]
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-red-500/40
                          bg-red-500/10
                          px-6
                          text-center
                          text-[11px]
                          text-red-200
                        "
                      >
                        <p>{cardsError}</p>

                        <button
                          type="button"
                          onClick={() =>
                            setCardReloadToken(
                              (current) =>
                                current + 1
                            )
                          }
                          className="
                            mt-1
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-red-200
                            underline-offset-2
                            transition-colors
                            hover:text-white
                            hover:underline
                          "
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : cardLoading ? (
                      <CardGridSkeleton />
                    ) : cards.length === 0 ? (
                      <div
                        className="
                          flex
                          min-h-[200px]
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-dashed
                          border-slate-700
                          px-6
                          text-center
                          text-[11px]
                          text-slate-400
                        "
                      >
                        <Search className="h-6 w-6 text-slate-600" />

                        <p>
                          No se encontraron cartas
                          con estos filtros.
                        </p>

                        <button
                          type="button"
                          onClick={resetCardFilters}
                          className="
                            mt-1
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-blue-300
                            transition-colors
                            hover:text-blue-200
                          "
                        >
                          Reiniciar filtros
                        </button>
                      </div>
                    ) : (
                      <CatalogGrid
                        cards={cards}
                        prefetch={false}
                        onNavigate={close}
                      />
                    )}
                  </div>

                  <footer
                    className="
                      shrink-0
                      border-t
                      border-slate-700/60
                      bg-[#0B132B]/95
                      px-3
                      py-2
                      sm:px-4
                    "
                  >
                    <GlobalPagination
                      currentPage={cardPage}
                      totalPages={cardPages}
                      total={cardTotal}
                      itemLabel="cartas"
                      onPageChange={(page) => {
                        setCardPage(page);

                        scrollResultsToTop();
                      }}
                    />
                  </footer>
                </>
              ) : tab === "skills" ? (
                <>
                  <GlobalSkillsControls
                    search={skillSearchInput}
                    character={skillCharacter}
                    characters={characters}
                    onSearchChange={
                      setSkillSearchInput
                    }
                    onCharacterChange={(value) => {
                      setSkillCharacter(value);

                      setSkillPage(1);
                    }}
                    onReset={resetSkills}
                    autoFocus
                  />

                  {skillsLoading && (
                    <div
                      aria-hidden
                      className="
                        h-0.5
                        w-full
                        shrink-0
                        animate-pulse
                        bg-blue-500/80
                      "
                    />
                  )}

                  <div
                    ref={resultsRef}
                    aria-busy={skillsLoading}
                    className="
                      min-h-0
                      flex-1
                      overflow-y-auto
                      overscroll-contain
                      px-2.5
                      py-2
                      sm:px-3
                    "
                  >
                    {skillsError ? (
                      <div
                        role="alert"
                        className="
                          flex
                          min-h-[200px]
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-red-500/40
                          bg-red-500/10
                          px-6
                          text-center
                          text-[11px]
                          text-red-200
                        "
                      >
                        <p>{skillsError}</p>

                        <button
                          type="button"
                          onClick={() =>
                            setSkillReloadToken(
                              (current) =>
                                current + 1
                            )
                          }
                          className="
                            mt-1
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-red-200
                            underline-offset-2
                            transition-colors
                            hover:text-white
                            hover:underline
                          "
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : skillLoading ? (
                      <SkillsSkeleton />
                    ) : skills.length === 0 ? (
                      <div
                        className="
                          flex
                          min-h-[200px]
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-dashed
                          border-slate-700
                          px-6
                          text-center
                          text-[11px]
                          text-slate-400
                        "
                      >
                        <Search className="h-6 w-6 text-slate-600" />

                        <p>
                          No se encontraron
                          habilidades con estos
                          filtros.
                        </p>

                        <button
                          type="button"
                          onClick={resetSkills}
                          className="
                            mt-1
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-blue-300
                            transition-colors
                            hover:text-blue-200
                          "
                        >
                          Reiniciar filtros
                        </button>
                      </div>
                    ) : (
                      <SkillsGrid skills={skills} />
                    )}
                  </div>

                  <footer
                    className="
                      shrink-0
                      border-t
                      border-slate-700/60
                      bg-[#0B132B]/95
                      px-3
                      py-2
                      sm:px-4
                    "
                  >
                    <GlobalPagination
                      currentPage={skillPage}
                      totalPages={skillPages}
                      total={skillTotal}
                      itemLabel="skills"
                      onPageChange={(page) => {
                        setSkillPage(page);

                        scrollResultsToTop();
                      }}
                    />
                  </footer>
                </>
              ) : null}
            </section>
          </div>,
          document.body
        )}
    </>
  );
}

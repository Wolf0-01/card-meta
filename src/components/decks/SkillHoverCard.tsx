"use client";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";

import type {
  TooltipAnchor,
} from "@/components/cards/CardHoverTooltip";

import { SKILL_CATEGORY_LABELS } from "@/data/skills";

import { findSkillByName } from "@/lib/skills/search";

import type {
  Skill,
  SkillCategory,
} from "@/types/skill";

interface SkillHoverCardProps {
  skillName: string;

  cards?: readonly SkillCardLike[];

  className?: string;

  children: ReactNode;
}

interface SkillCardLike {
  id: string | number;

  quantity?: number;

  card: {
    id: number;

    name: string;

    image: string | null;
  };
}

interface RelatedCardView {
  id: string | number;

  name: string;

  image: string | null;

  quantity?: number;
}

const remoteSkillCache = new Map<
  string,
  Skill | null
>();

const PANEL_WIDTH = 400;

const PANEL_HEIGHT = 380;

const GAP = 10;

const MAX_CARDS = 8;

const CATEGORY_ACCENTS: Record<
  SkillCategory,
  {
    strip: string;
    avatar: string;
    ring: string;
  }
> = {
  robo: {
    strip:
      "bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500",
    avatar: "from-sky-500 to-blue-700",
    ring: "ring-sky-400/40",
  },

  campo: {
    strip:
      "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500",
    avatar: "from-emerald-500 to-teal-700",
    ring: "ring-emerald-400/40",
  },

  ataque: {
    strip:
      "bg-gradient-to-r from-orange-400 via-red-400 to-rose-500",
    avatar: "from-orange-500 to-red-700",
    ring: "ring-orange-400/40",
  },

  fusion: {
    strip:
      "bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-500",
    avatar: "from-violet-500 to-purple-800",
    ring: "ring-violet-400/40",
  },

  invocacion: {
    strip:
      "bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-500",
    avatar: "from-indigo-500 to-blue-800",
    ring: "ring-indigo-400/40",
  },

  recuperacion: {
    strip:
      "bg-gradient-to-r from-teal-400 via-emerald-400 to-green-500",
    avatar: "from-teal-500 to-green-700",
    ring: "ring-teal-400/40",
  },

  especial: {
    strip:
      "bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500",
    avatar: "from-amber-500 to-orange-700",
    ring: "ring-amber-400/40",
  },
};

function getInitials(name: string) {
  if (
    !name.trim() ||
    name.toLowerCase().includes("desconocido")
  ) {
    return "?";
  }

  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

function normalizeCardName(name: string) {
  return name
    .trim()
    .toLowerCase();
}

function toRelatedCardViews(
  cards: readonly SkillCardLike[]
): RelatedCardView[] {
  return cards.map((entry) => ({
    id: entry.card.id,

    name: entry.card.name,

    image: entry.card.image,

    quantity: entry.quantity,
  }));
}

/*
 * Recupera la ficha de una skill desde Duel Links Meta
 * (a través de /api/skills), guardando el resultado en
 * la caché en memoria del módulo.
 */
async function loadRemoteSkill(
  name: string
): Promise<Skill | null> {
  const cacheKey = name.toLowerCase();

  const cached = remoteSkillCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(
      `/api/skills?name=${encodeURIComponent(
        name
      )}`
    );

    const data = response.ok
      ? ((await response.json()) as {
          skill?: Skill | null;
        } | null)
      : null;

    const skill = data?.skill ?? null;

    remoteSkillCache.set(cacheKey, skill);

    return skill;
  } catch {
    return null;
  }
}

function splitDescription(description: string) {
  const sentences = description
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const effects = sentences.filter(
    (sentence) => !/^this skill\b/i.test(sentence)
  );

  const requirements = sentences.filter(
    (sentence) => /^this skill\b/i.test(sentence)
  );

  return { effects, requirements };
}

function RelatedCardThumb({
  card,
}: {
  card: RelatedCardView;
}) {
  const [failed, setFailed] = useState(false);

  const imageSrc =
    failed || !card.image
      ? "/cards/default.jpg"
      : card.image;

  const isRemote = imageSrc.startsWith(
    "http"
  );

  return (
    <div
      className="
        relative
        w-10
        shrink-0
        overflow-hidden
        rounded
        border
        border-slate-700/80
        bg-slate-800
        shadow-sm
      "
      title={card.name}
      style={{ aspectRatio: "59 / 86" }}
    >
      <Image
        src={imageSrc}
        alt={card.name}
        fill
        sizes="40px"
        unoptimized={failed || isRemote}
        onError={() => setFailed(true)}
        className="object-contain"
      />

      {typeof card.quantity === "number" &&
        card.quantity > 1 && (
          <span
            className="
              absolute
              bottom-0
              right-0
              rounded-tl
              bg-black/85
              px-1
              text-[8px]
              font-black
              leading-4
              text-white
            "
          >
            ×{card.quantity}
          </span>
        )}
    </div>
  );
}

function SkillTooltip({
  skill,
  fallbackName,
  relatedCards,
  anchor,
}: {
  skill: Skill | null;
  fallbackName: string;
  relatedCards: readonly RelatedCardView[];
  anchor: TooltipAnchor;
}) {
  if (typeof window === "undefined") {
    return null;
  }

  const width = Math.min(
    PANEL_WIDTH,
    window.innerWidth - 16
  );

  let left =
    anchor.left + anchor.width / 2 - width / 2;

  left = Math.max(
    8,
    Math.min(
      left,
      window.innerWidth - width - 8
    )
  );

  const placeBelow =
    anchor.bottom + GAP + PANEL_HEIGHT <=
    window.innerHeight - 8;

  const rawTop = placeBelow
    ? anchor.bottom + GAP
    : anchor.top - PANEL_HEIGHT - GAP;

  const top = Math.max(
    8,
    Math.min(
      rawTop,
      window.innerHeight - PANEL_HEIGHT - 8
    )
  );

  const name = skill?.name ?? fallbackName;

  const character =
    skill?.character ?? "Duelista desconocido";

  const category = skill?.category ?? "especial";

  const accent = CATEGORY_ACCENTS[category];

  const description =
    skill?.description?.trim() ?? "";

  const { effects, requirements } =
    splitDescription(description);

  return createPortal(
    <div
      style={{
        position: "fixed",
        left,
        top,
        width,
        maxHeight: window.innerHeight - 16,
      }}
      className="
        pointer-events-none
        z-[150]
        overflow-hidden
        rounded-xl
        border
        border-slate-600/80
        bg-[#0B132B]
        shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)]
        ring-1
        ring-white/5
      "
    >
      <span
        aria-hidden
        className={`
          absolute
          inset-x-0
          top-0
          h-[3px]
          ${accent.strip}
        `}
      />

      <div className="p-3.5 pt-4">
        <div className="flex items-start gap-3">
          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              ${accent.avatar}
              text-sm
              font-black
              leading-none
              text-white
              shadow-lg
              ring-2
              ${accent.ring}
            `}
            aria-hidden
          >
            {getInitials(character)}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.18em]
                text-slate-400
              "
            >
              Skill ·{" "}
              {SKILL_CATEGORY_LABELS[category]}
            </p>

            <h3
              className="
                mt-0.5
                text-sm
                font-black
                leading-tight
                text-white
              "
            >
              {name}
            </h3>

            <p
              className="
                mt-0.5
                truncate
                text-[10px]
                font-semibold
                text-slate-400
              "
            >
              {character}
            </p>
          </div>
        </div>

        <div
          className="
            mt-3
            space-y-2
            border-t
            border-slate-700/60
            pt-3
          "
        >
          {effects.length > 0 && (
            <div className="space-y-1.5">
              {effects.map((paragraph) => (
                <div
                  key={paragraph}
                  className="flex gap-2"
                >
                  <span
                    aria-hidden
                    className="
                      mt-1
                      h-1.5
                      w-1.5
                      shrink-0
                      rotate-45
                      rounded-[1px]
                      bg-amber-400
                    "
                  />

                  <p
                    className="
                      text-[10px]
                      leading-4
                      text-slate-300
                    "
                  >
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          )}

          {requirements.length > 0 && (
            <div
              className="
                rounded-md
                border
                border-amber-400/25
                bg-amber-400/10
                px-2
                py-1.5
              "
            >
              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-amber-300/80
                "
              >
                Requisito
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  leading-4
                  text-amber-100/90
                "
              >
                {requirements.join(" ")}
              </p>
            </div>
          )}
        </div>

        {relatedCards.length > 0 && (
          <div
            className="
              mt-3
              border-t
              border-slate-700/60
              pt-2.5
            "
          >
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              Associated cards
            </p>

            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {relatedCards.map((card) => (
                <RelatedCardThumb
                  key={card.id}
                  card={card}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function SkillHoverCard({
  skillName,
  cards = [],
  className = "",
  children,
}: SkillHoverCardProps) {
  const [anchor, setAnchor] =
    useState<TooltipAnchor | null>(null);

  const [remoteState, setRemoteState] =
    useState<{
      key: string;
      skill: Skill | null;
    } | null>(null);

  const zoneRef = useRef<HTMLDivElement>(null);

  const trimmedName = skillName.trim();

  const localSkill = trimmedName
    ? findSkillByName(trimmedName)
    : null;

  const cacheKey = trimmedName.toLowerCase();

  /*
   * Cuando la skill no existe en el catálogo local,
   * se consulta la API pública de Duel Links Meta a
   * través de /api/skills. El resultado se guarda con
   * la clave del nombre para ignorar respuestas
   * atrasadas si el usuario pasa el cursor por otra
   * habilidad antes de que termine la consulta.
   */
  useEffect(() => {
    if (!trimmedName || localSkill) {
      return;
    }

    let cancelled = false;

    loadRemoteSkill(trimmedName).then(
      (skill) => {
        if (cancelled) {
          return;
        }

        setRemoteState({
          key: trimmedName.toLowerCase(),
          skill,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [trimmedName, localSkill]);

  const remoteSkill =
    remoteState?.key === cacheKey
      ? remoteState.skill
      : null;

  const skill = localSkill ?? remoteSkill;

  /*
   * Se muestran primero las cartas asociadas de la
   * skill (Duel Links Meta) y después las del mazo,
   * evitando duplicados por nombre.
   */
  const relatedCards = useMemo(() => {
    const views: RelatedCardView[] =
      toRelatedCardViews(cards);

    const seen = new Set(
      views.map((view) =>
        normalizeCardName(view.name)
      )
    );

    for (const related of skill?.relatedCards ??
      []) {
      const name = normalizeCardName(
        related.name
      );

      if (seen.has(name)) {
        continue;
      }

      seen.add(name);

      views.push(related);
    }

    return views.slice(0, MAX_CARDS);
  }, [cards, skill]);

  function showTooltip() {
    if (!trimmedName) {
      return;
    }

    const rect =
      zoneRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setAnchor({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
  }

  function hideTooltip() {
    setAnchor(null);
  }

  useEffect(() => {
    if (!anchor) {
      return;
    }

    function handleViewportChange() {
      setAnchor(null);
    }

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );

      window.removeEventListener(
        "resize",
        handleViewportChange
      );
    };
  }, [anchor]);

  return (
    <>
      <div
        ref={zoneRef}
        className={className}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {anchor && (
        <SkillTooltip
          skill={skill}
          fallbackName={trimmedName}
          relatedCards={relatedCards}
          anchor={anchor}
        />
      )}
    </>
  );
}

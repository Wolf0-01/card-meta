"use client";

import Image from "next/image";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  ArrowUpRight,
  Sparkles,
  UserRound,
} from "lucide-react";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import {
  getSkillSlug,
} from "@/lib/skills/slug";

import type {
  SkillMetaSummary,
} from "@/types/skill";

interface SkillLinkProps {
  /** Nombre visible de la Skill. */
  name: string;

  /**
   * Datos cargados desde el servidor (SkillMeta). Si no
   * existen, el enlace sigue funcionando y la tarjeta
   * emergente muestra solo el nombre.
   */
  meta?: SkillMetaSummary | null;

  className?: string;
}

const TOOLTIP_WIDTH = 360;

const TOOLTIP_HEIGHT = 260;

const GAP = 8;

interface Anchor {
  top: number;

  left: number;

  bottom: number;

  width: number;
}

function userInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

function SkillTooltip({
  id,
  meta,
  fallbackName,
  anchor,
}: {
  id: string;
  meta: SkillMetaSummary | null;
  fallbackName: string;
  anchor: Anchor;
}) {
  if (typeof window === "undefined") {
    return null;
  }

  const width = Math.min(
    TOOLTIP_WIDTH,
    window.innerWidth - 16
  );

  const left = Math.max(
    8,
    Math.min(
      anchor.left +
        anchor.width / 2 -
        width / 2,
      window.innerWidth - width - 8
    )
  );

  const fitsBelow =
    anchor.bottom +
      GAP +
      TOOLTIP_HEIGHT <=
    window.innerHeight - 8;

  const resolvedTop = fitsBelow
    ? anchor.bottom + GAP
    : anchor.top -
      TOOLTIP_HEIGHT -
      GAP;

  const top = Math.max(
    8,
    Math.min(
      resolvedTop,
      window.innerHeight -
        TOOLTIP_HEIGHT -
        8
    )
  );

  const name = meta?.name ?? fallbackName;

  const character =
    meta?.character ??
    meta?.characters[0] ??
    null;

  const characterLabel =
    meta?.characters.length
      ? meta.characters.join(" · ")
      : character ?? null;

  const characterImage =
    meta?.characterImages?.[0] ?? null;

  const description =
    meta?.description?.trim() ?? "";

  return createPortal(
    <div
      id={id}
      role="tooltip"
      style={{
        position: "fixed",
        left,
        top,
        width,
        maxHeight:
          window.innerHeight - 16,
      }}
      className="
        pointer-events-none
        z-[160]
        overflow-hidden
        rounded-xl
        border
        border-slate-600/80
        bg-[#0B132B]
        text-slate-200
        shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)]
        ring-1
        ring-white/5
      "
    >
      <span
        aria-hidden
        className="
          absolute
          inset-x-0
          top-0
          h-[3px]
          bg-gradient-to-r
          from-sky-400
          via-cyan-400
          to-blue-500
        "
      />

      <div className="p-3.5 pt-4">
        <div className="flex items-start gap-3">
          {characterImage ? (
            <Image
              src={characterImage.src}
              alt={characterImage.name}
              width={40}
              height={40}
              unoptimized
              className="
                h-10
                w-10
                shrink-0
                rounded-full
                bg-slate-800
                object-cover
                shadow-lg
                ring-2
                ring-sky-400/30
              "
            />
          ) : (
            <div
              aria-hidden
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-sky-500
                to-blue-800
                text-xs
                font-black
                leading-none
                text-white
                shadow-lg
                ring-2
                ring-sky-400/30
              "
            >
              {character
                ? userInitials(character)
                : "?"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.18em]
                text-sky-300/80
              "
            >
              Skill
              {meta?.format
                ? ` · ${getDuelFormatLabel(
                    meta.format
                  )}`
                : ""}
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
                flex
                items-center
                gap-1
                truncate
                text-[10px]
                font-semibold
                text-slate-400
              "
            >
              <UserRound className="h-2.5 w-2.5 shrink-0" />

              {characterLabel ??
                "Generic / multiple characters"}
            </p>
          </div>
        </div>

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
            Full effect
          </p>

          {description ? (
            <p
              className="
                mt-1
                whitespace-pre-line
                text-[10px]
                leading-4
                text-slate-300
              "
            >
              {description}
            </p>
          ) : (
            <p
              className="
                mt-1
                text-[10px]
                leading-4
                text-slate-500
              "
            >
              No effect description available
              for this Skill yet.
            </p>
          )}
        </div>

        <div
          className="
            mt-2.5
            flex
            items-center
            justify-between
            gap-2
            border-t
            border-slate-700/60
            pt-2
            text-[8px]
            font-black
            uppercase
            tracking-[0.14em]
          "
        >
          <span className="text-slate-500">
            {meta?.source ?? "Skill details"}
          </span>

          <span className="inline-flex items-center gap-1 text-sky-300">
            <Sparkles className="h-2.5 w-2.5" />
            Open skill
            <ArrowUpRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Nombre de Skill enlazado a su ficha pública. Al pasar el
 * mouse o recibir foco muestra una tarjeta oscura con el
 * efecto completo y el personaje.
 */
export default function SkillLink({
  name,
  meta = null,
  className = "",
}: SkillLinkProps) {
  const [anchor, setAnchor] =
    useState<Anchor | null>(null);

  const tooltipId = useId();

  const linkRef =
    useRef<HTMLAnchorElement>(null);

  const trimmedName = name.trim();

  const characterImage =
    meta?.characterImages?.[0] ?? null;

  const href = `/skills/${
    meta?.slug ?? getSkillSlug(trimmedName)
  }`;

  const showTooltip = useCallback(() => {
    if (!trimmedName) {
      return;
    }

    const rect =
      linkRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setAnchor({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      width: rect.width,
    });
  }, [trimmedName]);

  const hideTooltip = useCallback(() => {
    setAnchor(null);
  }, []);

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

  if (!trimmedName) {
    return (
      <span
        className={`
          text-xs
          font-bold
          text-slate-400
          ${className}
        `}
      >
        No Skill
      </span>
    );
  }

  return (
    <>
      <Link
        ref={linkRef}
        href={href}
        title={meta?.name ?? trimmedName}
        aria-describedby={
          anchor ? tooltipId : undefined
        }
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`
          inline-flex
          max-w-full
          items-center
          gap-1.5
          align-baseline
          transition-colors
          hover:text-sky-300
          focus:outline-none
          focus-visible:text-sky-300
          focus-visible:underline
          focus-visible:underline-offset-2
          ${className}
        `}
      >
        {characterImage && (
          <Image
            src={characterImage.src}
            alt=""
            width={16}
            height={16}
            unoptimized
            className="
              h-4
              w-4
              shrink-0
              rounded-full
              bg-slate-800
              object-cover
              ring-1
              ring-sky-400/30
            "
          />
        )}

        <span className="truncate">
          {trimmedName}
        </span>
      </Link>

      {anchor && (
        <SkillTooltip
          id={tooltipId}
          meta={meta}
          fallbackName={trimmedName}
          anchor={anchor}
        />
      )}
    </>
  );
}

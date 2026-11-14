"use client";

import {
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

import { SKILL_CATEGORY_LABELS } from "@/data/skills";

import type { Skill } from "@/types/skill";

interface SkillCardTileProps {
  skill: Skill;

  assigned: boolean;

  onAssign: (skill: Skill) => void;
}

const CLAMP_LENGTH = 170;

export default function SkillCardTile({
  skill,
  assigned,
  onAssign,
}: SkillCardTileProps) {
  const [expanded, setExpanded] =
    useState(false);

  const canExpand =
    skill.description.length > CLAMP_LENGTH;

  return (
    <article
      className={`
        rounded-lg
        border
        p-2.5
        transition-colors
        ${
          assigned
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-slate-700/70 bg-[#070D1F] hover:border-slate-600/80"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className="
              flex
              items-center
              gap-1
              text-xs
              font-black
              leading-4
              text-white
            "
          >
            <Zap className="h-3 w-3 shrink-0 text-amber-300" />

            <span className="truncate">
              {skill.name}
            </span>
          </h3>

          <p
            className="
              mt-0.5
              flex
              flex-wrap
              items-center
              gap-1
              text-[9px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            <span className="truncate">
              {skill.character}
            </span>

            <span
              className="
                rounded
                bg-slate-800
                px-1
                py-0.5
                text-[8px]
                font-black
                tracking-[0.08em]
                text-slate-300
              "
            >
              {SKILL_CATEGORY_LABELS[skill.category]}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAssign(skill)}
          aria-label={`Assign ${skill.name} to the Deck Builder draft`}
          className={`
            inline-flex
            h-7
            shrink-0
            items-center
            gap-1
            rounded-md
            border
            px-2
            text-[9px]
            font-black
            uppercase
            tracking-wide
            transition-colors
            ${
              assigned
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                : "border-amber-500/40 bg-amber-500/10 text-amber-200 hover:border-amber-400 hover:bg-amber-500/20"
            }
          `}
        >
          {assigned ? (
            <Check className="h-3 w-3" />
          ) : (
            <Zap className="h-3 w-3" />
          )}

          {assigned ? "Asignada" : "Asignar"}
        </button>
      </div>

      <p
        className={`
          mt-1.5
          text-[10px]
          leading-4
          text-slate-400
          ${expanded ? "" : "line-clamp-3"}
        `}
      >
        {skill.description}
      </p>

      {canExpand && (
        <button
          type="button"
          onClick={() =>
            setExpanded((current) => !current)
          }
          className="
            mt-1
            inline-flex
            items-center
            gap-0.5
            text-[9px]
            font-bold
            uppercase
            tracking-wide
            text-blue-300
            transition-colors
            hover:text-blue-200
          "
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show more
            </>
          )}
        </button>
      )}
    </article>
  );
}

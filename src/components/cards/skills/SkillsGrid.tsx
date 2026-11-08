"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Check,
  ExternalLink,
} from "lucide-react";

import { assignSkillToDeckDraft } from "@/lib/decks/draftStorage";

import type { Skill } from "@/types/skill";

import SkillCardTile from "./SkillCardTile";

interface SkillsGridProps {
  skills: Skill[];
}

export default function SkillsGrid({
  skills,
}: SkillsGridProps) {
  const [assigned, setAssigned] =
    useState<Skill | null>(null);

  function handleAssign(skill: Skill) {
    assignSkillToDeckDraft(skill.name);

    setAssigned(skill);
  }

  return (
    <div className="space-y-2">
      {assigned && (
        <div
          role="status"
          aria-live="polite"
          className="
            flex
            flex-wrap
            items-center
            gap-1.5
            rounded-lg
            border
            border-emerald-500/30
            bg-emerald-500/10
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            text-emerald-200
          "
        >
          <Check className="h-3.5 w-3.5 shrink-0" />

          <span className="min-w-0 flex-1">
            <span className="font-black">
              {assigned.name}
            </span>{" "}
            asignada al borrador.
          </span>

          <Link
            href="/decks/new"
            className="
              inline-flex
              items-center
              gap-0.5
              font-black
              uppercase
              tracking-wide
              text-emerald-300
              transition-colors
              hover:text-emerald-100
            "
          >
            Abrir Deck Builder
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {skills.map((skill) => (
          <SkillCardTile
            key={skill.id}
            skill={skill}
            assigned={assigned?.id === skill.id}
            onAssign={handleAssign}
          />
        ))}
      </div>
    </div>
  );
}

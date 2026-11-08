export const DECK_DRAFT_STORAGE_KEY =
  "cardmeta-deck-draft-v1";

export const DECK_DRAFT_SKILL_EVENT =
  "cardmeta:deck-draft-skill";

interface StoredDraft {
  cards: unknown[];

  name: string;

  description: string;

  isPublic: boolean;

  skill: string;
}

function readStoredDraft():
  | Partial<StoredDraft>
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        DECK_DRAFT_STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(
      raw
    ) as Partial<StoredDraft>;
  } catch {
    return null;
  }
}

export interface AssignSkillResult {
  ok: boolean;

  hadDraft: boolean;
}

/**
 * Asigna una skill al borrador local del Deck Builder
 * sin tocar los mazos guardados en la base de datos.
 */
export function assignSkillToDeckDraft(
  skill: string
): AssignSkillResult {
  if (typeof window === "undefined") {
    return {
      ok: false,
      hadDraft: false,
    };
  }

  const stored = readStoredDraft();

  const next: StoredDraft = {
    cards: Array.isArray(stored?.cards)
      ? stored.cards
      : [],

    name:
      typeof stored?.name === "string"
        ? stored.name
        : "",

    description:
      typeof stored?.description === "string"
        ? stored.description
        : "",

    isPublic:
      typeof stored?.isPublic === "boolean"
        ? stored.isPublic
        : false,

    skill: skill.trim(),
  };

  try {
    window.localStorage.setItem(
      DECK_DRAFT_STORAGE_KEY,
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new CustomEvent(DECK_DRAFT_SKILL_EVENT, {
        detail: {
          skill: next.skill,
        },
      })
    );

    return {
      ok: true,
      hadDraft: stored !== null,
    };
  } catch {
    return {
      ok: false,
      hadDraft: stored !== null,
    };
  }
}

import type {
  Skill,
  SkillCategory,
} from "@/types/skill";

const DLM_SKILLS_URL =
  "https://www.duellinksmeta.com/api/v1/skills";

const DLM_CARD_IMAGE_URL =
  "https://imgserv.duellinksmeta.com/v2/dlm/card";

const FOUND_CACHE_TTL = 1000 * 60 * 60 * 24;

const MISS_CACHE_TTL = 1000 * 60 * 10;

const REQUEST_TIMEOUT = 5000;

interface DlmCharacterEntry {
  character?: {
    name?: string;
  };
}

interface DlmRelatedCard {
  _id?: string;

  name?: string;
}

interface DlmSkill {
  _id?: string;

  name?: string;

  description?: string;

  characters?: DlmCharacterEntry[];

  relatedCards?: DlmRelatedCard[];
}

interface CacheEntry {
  skill: Skill | null;

  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function inferCategory(
  skill: DlmSkill
): SkillCategory {
  const text =
    `${skill.name ?? ""} ${
      skill.description ?? ""
    }`.toLowerCase();

  if (/normal draw|draw a card/.test(text)) {
    return "robo";
  }

  if (/fusion summon/.test(text)) {
    return "fusion";
  }

  if (
    /special summon|normal summon|summon/.test(
      text
    )
  ) {
    return "invocacion";
  }

  if (/increase .*atk|piercing/.test(text)) {
    return "ataque";
  }

  if (/life points|recover/.test(text)) {
    return "recuperacion";
  }

  if (/field spell|terrain/.test(text)) {
    return "campo";
  }

  return "especial";
}

function resolveCharacter(skill: DlmSkill) {
  const names = (skill.characters ?? [])
    .map((entry) =>
      entry.character?.name?.trim()
    )
    .filter(
      (name): name is string =>
        Boolean(name)
    );

  if (names.length === 0) {
    return "Personaje genérico";
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names[0]} y ${
    names.length - 1
  } más`;
}

function resolveRelatedCards(
  skill: DlmSkill
) {
  return (skill.relatedCards ?? [])
    .filter(
      (
        card
      ): card is DlmRelatedCard & {
        _id: string;
        name: string;
      } => Boolean(card._id && card.name)
    )
    .slice(0, 12)
    .map((card) => ({
      id: card._id,

      name: card.name,

      image: `${DLM_CARD_IMAGE_URL}/${encodeURIComponent(
        card._id
      )}?width=160`,
    }));
}

function mapDlmSkill(
  skill: DlmSkill
): Skill | null {
  const name = skill.name?.trim();

  if (!name) {
    return null;
  }

  return {
    id: skill._id ?? name,

    name,

    character: resolveCharacter(skill),

    category: inferCategory(skill),

    description:
      skill.description?.trim() ?? "",

    relatedCards: resolveRelatedCards(skill),
  };
}

async function requestSkills(
  params: URLSearchParams
) {
  params.set("limit", "10");

  params.set(
    "fields",
    "name,description,characters,relatedCards"
  );

  const response = await fetch(
    `${DLM_SKILLS_URL}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 60 * 60 * 24,
      },

      signal: AbortSignal.timeout(
        REQUEST_TIMEOUT
      ),
    }
  );

  if (!response.ok) {
    return [];
  }

  const payload: unknown =
    await response.json();

  return Array.isArray(payload)
    ? (payload as DlmSkill[])
    : [];
}

function findExactMatch(
  skills: DlmSkill[],
  name: string
) {
  const term = normalize(name);

  return (
    skills.find(
      (skill) =>
        normalize(skill.name ?? "") === term
    ) ?? null
  );
}

/**
 * Consulta la API pública de Duel Links Meta y adapta
 * la respuesta al modelo local de Skills.
 */
export async function fetchDlmSkillByName(
  name: string
): Promise<Skill | null> {
  const trimmed = name.trim();

  if (!trimmed) {
    return null;
  }

  const cacheKey = normalize(trimmed);

  const now = Date.now();

  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.skill;
  }

  try {
    let match = findExactMatch(
      await requestSkills(
        new URLSearchParams({
          name: trimmed,
        })
      ),
      trimmed
    );

    if (!match) {
      const matches = await requestSkills(
        new URLSearchParams({
          "name[$regex]":
            escapeRegex(trimmed),
        })
      );

      match =
        findExactMatch(matches, trimmed) ??
        matches[0] ??
        null;
    }

    const skill = match
      ? mapDlmSkill(match)
      : null;

    cache.set(cacheKey, {
      skill,

      expiresAt:
        now +
        (skill
          ? FOUND_CACHE_TTL
          : MISS_CACHE_TTL),
    });

    return skill;
  } catch {
    return null;
  }
}

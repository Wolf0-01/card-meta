import type {
Archetype,
} from "@prisma/client";

import type {
ArchetypeData,
} from "@/types/meta";

// ======================================
// Prisma Archetype -> ArchetypeData
// ======================================

export function mapPrismaArchetype(
archetype: Archetype | null
): ArchetypeData | null {
if (!archetype) {
return null;
}

return {
id: String(archetype.id),


name: archetype.name,

slug: archetype.slug,

image: archetype.image,

description: archetype.description,


};
}


// ======================================
// Legacy / mixed archetype -> ArchetypeData
// ======================================

export function normalizeArchetype(
archetype:
| string
| ArchetypeData
| null
| undefined
): ArchetypeData | null {
if (!archetype) {
return null;
}

if (typeof archetype === "string") {
const name = archetype.trim();

if (!name) {
  return null;
}

return {
  id: name,

  name,

  slug: name
    .toLowerCase()
    .replace(/\s+/g, "-"),

  image: null,

  description: null,
};


}

return archetype;
}

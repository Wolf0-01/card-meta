import { prisma } from "@/lib/prisma";

import { getPublicDecksByAuthor } from "@/lib/decks";

import type { MetaDeck } from "@/types/meta";

export interface PublicUserProfile {
  id: string;

  username: string;

  displayName: string | null;

  avatarUrl: string | null;

  bio: string | null;

  role: "USER" | "EDITOR" | "ADMIN";

  createdAt: Date;
}

/**
 * Localiza un jugador por su @username sin distinguir
 * mayúsculas. Devuelve solo datos públicos.
 */
export async function findPublicUserByUsername(
  username: string
): Promise<PublicUserProfile | null> {
  const term = username.trim();

  if (!term) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      username: {
        equals: term,
        mode: "insensitive",
      },
    },

    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  });
}

/**
 * Perfil público del jugador con todos sus mazos públicos,
 * listos para pintarse en DECKS PLAYED.
 */
export async function getPublicUserProfile(
  username: string
): Promise<{
  user: PublicUserProfile;
  decks: MetaDeck[];
} | null> {
  const user =
    await findPublicUserByUsername(username);

  if (!user) {
    return null;
  }

  const decks = await getPublicDecksByAuthor(
    user.id
  );

  return {
    user,
    decks,
  };
}

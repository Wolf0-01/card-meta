import { prisma } from "@/lib/prisma";

import { readSession } from "./session";

export const publicUserSelect = {
  id: true,

  email: true,

  username: true,

  displayName: true,

  avatar: true,

  role: true,

  createdAt: true,
} as const;

export interface AuthUser {
  id: string;

  email: string;

  username: string;

  displayName: string | null;

  avatar: string | null;

  role: "USER" | "EDITOR" | "ADMIN";

  createdAt: Date;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await readSession();

  if (!session) {
    return null;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: session.sub,
      },

      select: publicUserSelect,
    });

  return user;
}

import { NextResponse } from "next/server";

import {
  publicUserSelect,
} from "@/lib/auth/currentUser";

import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma";

import {
  loginSchema,
  toFieldErrors,
} from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(
  request: Request
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "The request body is not valid JSON",
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Check the form data",

        fieldErrors: toFieldErrors(
          parsed.error
        ),
      },
      {
        status: 422,
      }
    );
  }

  const {
    identifier,
    password,
  } = parsed.data;

  const normalized =
    identifier.toLowerCase();

  const user =
    await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: normalized,
          },
          {
            username: normalized,
          },
        ],
      },
    });

    if (!user || !user.passwordHash) {
    return NextResponse.json(
      {
        error:
          "Incorrect email, username or password",
      },
      {
        status: 401,
      }
    );
  }

  const passwordMatches =
    await verifyPassword(
      password,
      user.passwordHash
    );

  if (!passwordMatches) {
    return NextResponse.json(
      {
        error:
          "Incorrect email, username or password",
      },
      {
        status: 401,
      }
    );
  }

  await createSession({
    sub: user.id,

    email: user.email,

    username: user.username,

    role: user.role,
  });

  const safeUser =
    await prisma.user.findUniqueOrThrow(
      {
        where: {
          id: user.id,
        },

        select: publicUserSelect,
      }
    );

  return NextResponse.json({
    user: safeUser,
  });
}

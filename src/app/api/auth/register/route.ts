import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  publicUserSelect,
} from "@/lib/auth/currentUser";

import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

import { prisma } from "@/lib/prisma";

import {
  registerSchema,
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
          "El cuerpo de la petición no es JSON válido",
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Revisa los datos del formulario",

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
    name,
    username,
    email,
    password,
  } = parsed.data;

  const existing =
    await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },

      select: {
        email: true,
        username: true,
      },
    });

  if (existing) {
    const emailTaken =
      existing.email === email;

    return NextResponse.json(
      {
        error: emailTaken
          ? "Ese email ya está registrado"
          : "Ese nombre de usuario ya está en uso",

        fieldErrors: {
          [emailTaken
            ? "email"
            : "username"]: emailTaken
            ? "Ese email ya está registrado"
            : "Ese nombre de usuario ya está en uso",
        },
      },
      {
        status: 409,
      }
    );
  }

  try {
    const passwordHash =
      await hashPassword(password);

    const user =
      await prisma.user.create({
        data: {
          email,

          username,

          passwordHash,

          displayName:
            name?.trim() ||
            username,
        },

        select: publicUserSelect,
      });

    await createSession({
      sub: user.id,

      email: user.email,

      username: user.username,

      role: user.role,
    });

    return NextResponse.json(
      {
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Ese email o nombre de usuario ya está registrado",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo crear la cuenta. Inténtalo de nuevo.",
      },
      {
        status: 500,
      }
    );
  }
}

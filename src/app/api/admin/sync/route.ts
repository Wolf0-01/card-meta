import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import {
  isAdminSyncTask,
  runAdminSync,
} from "@/lib/admin/sync";

import {
  forbidden,
  requireUser,
  unauthorized,
} from "@/lib/auth/requireUser";

import { isAdmin } from "@/lib/auth/roles";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!user) {
    return unauthorized();
  }

  if (!isAdmin(user)) {
    return forbidden(
      "Solo un administrador puede ejecutar sincronizaciones"
    );
  }

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

  const task =
    body &&
    typeof body === "object" &&
    "task" in body
      ? (body as { task?: unknown }).task
      : undefined;

  if (!isAdminSyncTask(task)) {
    return NextResponse.json(
      {
        error: "Tarea de sincronización no válida",
      },
      {
        status: 422,
      }
    );
  }

  try {
    const result = await runAdminSync(task);

    revalidatePath("/", "layout");

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "ADMIN SYNC ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo ejecutar la sincronización",
      },
      {
        status: 500,
      }
    );
  }
}

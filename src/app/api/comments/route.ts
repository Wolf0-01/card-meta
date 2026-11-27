import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/prisma";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  role: true,
} as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const targetId = searchParams.get("targetId");

  if (!targetId || (type !== "deck" && type !== "tournament")) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: type === "deck" ? { deckId: targetId } : { tournamentId: targetId },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { user: { select: AUTHOR_SELECT } },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type;
  const targetId = typeof body?.targetId === "string" ? body.targetId : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!targetId || (type !== "deck" && type !== "tournament")) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  if (!content || content.length > 600) {
    return NextResponse.json(
      { error: "Comment must be between 1 and 600 characters." },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: user.id,
      ...(type === "deck" ? { deckId: targetId } : { tournamentId: targetId }),
    },
    include: { user: { select: AUTHOR_SELECT } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
  }

  const existing = await prisma.comment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const isStaff = user.role === "ADMIN" || user.role === "EDITOR";
  if (existing.userId !== user.id && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

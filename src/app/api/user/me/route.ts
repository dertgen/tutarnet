import { NextRequest, NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/user-session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const result = await requireUserSession(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { session } = result;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar_url: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      user: user ?? {
        id: session.userId,
        email: session.email,
        name: session.name ?? null,
        phone: null,
        avatar_url: null,
        created_at: null,
      },
      stats: { alerts: 0, triggered: 0, favorites: 0, viewed: 0 },
      recentAlerts: [],
    });
  } catch {
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name ?? null,
        phone: null,
        avatar_url: null,
        created_at: null,
      },
      stats: { alerts: 0, triggered: 0, favorites: 0, viewed: 0 },
      recentAlerts: [],
    });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const result = await requireUserSession(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { session } = result;
  const body: { name?: string; phone?: string } = await req.json();

  try {
    const updated = await prisma.user.upsert({
      where: { id: session.userId },
      update: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
      },
      create: {
        id: session.userId,
        email: session.email,
        name: body.name ?? session.name ?? "",
        phone: body.phone ?? null,
      },
      select: { id: true, email: true, name: true, phone: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: "Profil güncellenemedi: " + message },
      { status: 500 }
    );
  }
}

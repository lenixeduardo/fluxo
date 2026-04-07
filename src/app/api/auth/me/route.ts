// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/token";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user)   return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const { passwordHash, ...safe } = user;
  return NextResponse.json(safe);
}

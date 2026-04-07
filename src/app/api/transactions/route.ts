// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/token";
import { db } from "@/lib/db";

const createSchema = z.object({
  amount:      z.number().positive(),
  description: z.string().min(1),
  type:        z.enum(["INCOME", "EXPENSE"]),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId:  z.string(),
});

// GET /api/transactions
export async function GET(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const transactions = await db.transaction.findMany({
    where:   { userId: payload.userId },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  // Serialize Decimal → number
  return NextResponse.json(
    transactions.map((t) => ({ ...t, amount: Number(t.amount) }))
  );
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const tx   = await db.transaction.create({
      data: {
        ...body,
        date:   new Date(body.date),
        userId: payload.userId,
      },
      include: { category: true },
    });
    return NextResponse.json({ ...tx, amount: Number(tx.amount) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE /api/transactions?id=xxx
export async function DELETE(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  const tx = await db.transaction.findFirst({ where: { id, userId: payload.userId } });
  if (!tx)  return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });

  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

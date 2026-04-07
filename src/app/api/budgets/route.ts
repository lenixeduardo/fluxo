// src/app/api/budgets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/token";
import { db } from "@/lib/db";
import { currentPeriod } from "@/lib/utils";

const saveSchema = z.array(
  z.object({ categoryId: z.string(), amount: z.number().min(0) })
);

// GET /api/budgets  — returns budgets for current month
export async function GET(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { month, year } = currentPeriod();
  const budgets = await db.budget.findMany({
    where:   { userId: payload.userId, month, year },
    include: { category: true },
  });

  return NextResponse.json(
    budgets.map((b) => ({ ...b, amount: Number(b.amount) }))
  );
}

// PUT /api/budgets  — full replace for current month
export async function PUT(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const items         = saveSchema.parse(await req.json());
    const { month, year } = currentPeriod();

    // Upsert each item, delete those with amount = 0
    const ops = items.map((item) =>
      item.amount > 0
        ? db.budget.upsert({
            where:  { userId_categoryId_month_year: { userId: payload.userId, categoryId: item.categoryId, month, year } },
            update: { amount: item.amount },
            create: { userId: payload.userId, categoryId: item.categoryId, month, year, amount: item.amount },
          })
        : db.budget.deleteMany({
            where: { userId: payload.userId, categoryId: item.categoryId, month, year },
          })
    );

    await db.$transaction(ops);

    const saved = await db.budget.findMany({
      where:   { userId: payload.userId, month, year },
      include: { category: true },
    });

    return NextResponse.json(saved.map((b) => ({ ...b, amount: Number(b.amount) })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// src/app/api/ai/classify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/token";
import { classifyTransaction } from "@/lib/anthropic";

const schema = z.object({
  description: z.string().min(1),
  type:        z.enum(["INCOME", "EXPENSE"]),
  categories:  z.array(z.object({
    id:    z.string(),
    name:  z.string(),
    icon:  z.string(),
    color: z.string(),
    type:  z.enum(["INCOME", "EXPENSE", "BOTH"]),
  })),
});

export async function POST(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body   = schema.parse(await req.json());
    const result = await classifyTransaction(body.description, body.type, body.categories);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

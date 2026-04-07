// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { db } from "@/lib/db";

const schema = z.object({
  name:     z.string().min(2, "Informe seu nome completo."),
  email:    z.string().email("Email inválido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const exists = await db.user.findUnique({ where: { email: body.email } });
    if (exists) return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await db.user.create({
      data: { name: body.name.trim(), email: body.email, passwordHash },
    });

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token  = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ token, user: safe }, { status: 201 });
  } catch (e: any) {
    const msg = e.errors?.[0]?.message ?? e.message ?? "Erro interno.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

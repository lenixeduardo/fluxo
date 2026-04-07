// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { db } from "@/lib/db";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body   = schema.parse(await req.json());
    const user   = await db.user.findUnique({ where: { email: body.email } });
    if (!user) return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });

    const valid  = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid)  return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token  = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const { passwordHash, ...safe } = user;
    return NextResponse.json({ token, user: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erro interno." }, { status: 400 });
  }
}

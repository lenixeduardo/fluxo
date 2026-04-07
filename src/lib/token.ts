// src/lib/token.ts
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export interface JWTPayload { userId: string; }

export async function verifyToken(req: NextRequest): Promise<JWTPayload | null> {
  const header = req.headers.get("authorization") ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    const secret  = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

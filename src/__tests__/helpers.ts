import { SignJWT } from 'jose'
import { NextRequest } from 'next/server'

const SECRET = process.env.NEXTAUTH_SECRET!

export async function makeToken(userId = 'user-1'): Promise<string> {
  const key = new TextEncoder().encode(SECRET)
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(key)
}

export function makeReq(
  url: string,
  opts: { method?: string; body?: object; token?: string } = {}
): NextRequest {
  const headers: Record<string, string> = {}
  if (opts.token) headers['authorization'] = `Bearer ${opts.token}`
  if (opts.body)  headers['content-type']  = 'application/json'

  return new NextRequest(`http://localhost:3000${url}`, {
    method: opts.method ?? (opts.body ? 'POST' : 'GET'),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
}

import { GET } from '@/app/api/auth/me/route'
import { makeReq, makeToken } from '../../helpers'

jest.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: jest.fn() },
  },
}))

const { db } = require('@/lib/db') as { db: any }

const STORED_USER = {
  id:           'user-1',
  name:         'João Silva',
  email:        'joao@test.com',
  passwordHash: '$2b$hashed',
  plan:         'FREE',
  createdAt:    new Date(),
  updatedAt:    new Date(),
}

describe('GET /api/auth/me', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna dados do usuário com token válido', async () => {
    const token = await makeToken('user-1')
    db.user.findUnique.mockResolvedValue(STORED_USER)

    const res  = await GET(makeReq('/api/auth/me', { token }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.email).toBe('joao@test.com')
    expect(body.passwordHash).toBeUndefined()
  })

  it('retorna 401 sem token', async () => {
    const res = await GET(makeReq('/api/auth/me'))
    expect(res.status).toBe(401)
  })

  it('retorna 401 com token inválido', async () => {
    const res  = await GET(makeReq('/api/auth/me', { token: 'token.invalido.aqui' }))
    expect(res.status).toBe(401)
  })

  it('retorna 401 com token expirado', async () => {
    const { SignJWT } = require('jose')
    const key   = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    const token = await new SignJWT({ userId: 'user-1' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1s')
      .sign(key)

    // Wait for expiry
    await new Promise((r) => setTimeout(r, 1100))

    const res = await GET(makeReq('/api/auth/me', { token }))
    expect(res.status).toBe(401)
  })

  it('retorna 404 se usuário foi deletado', async () => {
    const token = await makeToken('deleted-user')
    db.user.findUnique.mockResolvedValue(null)

    const res = await GET(makeReq('/api/auth/me', { token }))
    expect(res.status).toBe(404)
  })
})

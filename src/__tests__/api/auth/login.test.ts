import { POST } from '@/app/api/auth/login/route'
import { makeReq } from '../../helpers'

jest.mock('bcryptjs', () => ({ compare: jest.fn() }))

jest.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: jest.fn() },
  },
}))

const { db }         = require('@/lib/db') as { db: any }
const { compare: mockCompare } = require('bcryptjs') as { compare: jest.Mock }

const STORED_USER = {
  id:           'user-1',
  name:         'João Silva',
  email:        'joao@test.com',
  passwordHash: '$2b$12$hashed',
  plan:         'FREE',
  createdAt:    new Date(),
  updatedAt:    new Date(),
}

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna token e usuário com credenciais válidas', async () => {
    db.user.findUnique.mockResolvedValue(STORED_USER)
    mockCompare.mockResolvedValue(true)

    const res  = await POST(makeReq('/api/auth/login', { body: { email: 'joao@test.com', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.token).toBeDefined()
    expect(body.user.email).toBe('joao@test.com')
    expect(body.user.passwordHash).toBeUndefined()
  })

  it('retorna 401 quando usuário não existe', async () => {
    db.user.findUnique.mockResolvedValue(null)

    const res  = await POST(makeReq('/api/auth/login', { body: { email: 'desconhecido@test.com', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toMatch(/incorretos/)
  })

  it('retorna 401 com senha incorreta', async () => {
    db.user.findUnique.mockResolvedValue(STORED_USER)
    mockCompare.mockResolvedValue(false)

    const res  = await POST(makeReq('/api/auth/login', { body: { email: 'joao@test.com', password: 'errada' } }))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toMatch(/incorretos/)
  })

  it('retorna 400 com email inválido', async () => {
    const res  = await POST(makeReq('/api/auth/login', { body: { email: 'nao-e-email', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(400)
  })

  it('retorna 400 quando senha está ausente', async () => {
    const res  = await POST(makeReq('/api/auth/login', { body: { email: 'joao@test.com' } }))
    const body = await res.json()

    expect(res.status).toBe(400)
  })

  it('retorna 400 quando body está vazio', async () => {
    const res  = await POST(makeReq('/api/auth/login', { body: {} }))
    expect(res.status).toBe(400)
  })
})

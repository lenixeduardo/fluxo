import { POST } from '@/app/api/auth/register/route'
import { makeReq } from '../../helpers'

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$hashed'),
}))

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const { db } = require('@/lib/db') as { db: any }

const VALID_USER = {
  id:           'user-1',
  name:         'João Silva',
  email:        'joao@test.com',
  passwordHash: '$hashed',
  plan:         'FREE',
  createdAt:    new Date(),
  updatedAt:    new Date(),
}

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('cria usuário e retorna token com dados válidos', async () => {
    db.user.findUnique.mockResolvedValue(null)
    db.user.create.mockResolvedValue(VALID_USER)

    const res  = await POST(makeReq('/api/auth/register', { body: { name: 'João Silva', email: 'joao@test.com', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.token).toBeDefined()
    expect(body.user.email).toBe('joao@test.com')
    expect(body.user.passwordHash).toBeUndefined()
  })

  it('retorna 409 se email já cadastrado', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'existing' })

    const res  = await POST(makeReq('/api/auth/register', { body: { name: 'João Silva', email: 'joao@test.com', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.error).toMatch(/já está cadastrado/)
  })

  it('retorna 400 com email inválido', async () => {
    const res  = await POST(makeReq('/api/auth/register', { body: { name: 'João Silva', email: 'nao-e-email', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('retorna 400 quando senha tem menos de 6 caracteres', async () => {
    const res  = await POST(makeReq('/api/auth/register', { body: { name: 'João Silva', email: 'joao@test.com', password: '123' } }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/6 caracteres/)
  })

  it('retorna 400 quando nome tem menos de 2 caracteres', async () => {
    const res  = await POST(makeReq('/api/auth/register', { body: { name: 'A', email: 'joao@test.com', password: 'senha123' } }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/nome completo/)
  })

  it('retorna 400 quando body está vazio', async () => {
    const res  = await POST(makeReq('/api/auth/register', { body: {} }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBeDefined()
  })
})

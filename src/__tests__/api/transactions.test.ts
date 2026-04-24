import { GET, POST, DELETE } from '@/app/api/transactions/route'
import { makeReq, makeToken } from '../helpers'

jest.mock('@/lib/db', () => ({
  db: {
    transaction: {
      findMany:  jest.fn(),
      create:    jest.fn(),
      findFirst: jest.fn(),
      delete:    jest.fn(),
    },
  },
}))

const { db } = require('@/lib/db') as { db: any }

const MOCK_TX = {
  id:          'tx-1',
  amount:      100,
  description: 'Salário',
  type:        'INCOME',
  date:        new Date('2024-04-01'),
  createdAt:   new Date(),
  userId:      'user-1',
  categoryId:  'cat-1',
  category:    { id: 'cat-1', name: 'Trabalho', icon: '💼', color: '#00F', type: 'INCOME' },
}

// ─── GET ────────────────────────────────────────────────────────────────────

describe('GET /api/transactions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna lista de transações com token válido', async () => {
    const token = await makeToken()
    db.transaction.findMany.mockResolvedValue([MOCK_TX])

    const res  = await GET(makeReq('/api/transactions', { token }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body[0].id).toBe('tx-1')
    expect(body[0].amount).toBe(100)
  })

  it('retorna lista vazia quando não há transações', async () => {
    const token = await makeToken()
    db.transaction.findMany.mockResolvedValue([])

    const res  = await GET(makeReq('/api/transactions', { token }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([])
  })

  it('retorna 401 sem token', async () => {
    const res = await GET(makeReq('/api/transactions'))
    expect(res.status).toBe(401)
  })
})

// ─── POST ───────────────────────────────────────────────────────────────────

describe('POST /api/transactions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('cria transação com dados válidos', async () => {
    const token = await makeToken()
    db.transaction.create.mockResolvedValue(MOCK_TX)

    const res  = await POST(makeReq('/api/transactions', {
      token,
      body: { amount: 100, description: 'Salário', type: 'INCOME', date: '2024-04-01', categoryId: 'cat-1' },
    }))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.id).toBe('tx-1')
    expect(db.transaction.create).toHaveBeenCalledTimes(1)
  })

  it('retorna 401 sem token', async () => {
    const res = await POST(makeReq('/api/transactions', { body: { amount: 100 } }))
    expect(res.status).toBe(401)
  })

  it('retorna 400 com amount negativo', async () => {
    const token = await makeToken()

    const res  = await POST(makeReq('/api/transactions', {
      token,
      body: { amount: -50, description: 'Erro', type: 'EXPENSE', date: '2024-04-01', categoryId: 'cat-1' },
    }))

    expect(res.status).toBe(400)
  })

  it('retorna 400 com tipo inválido', async () => {
    const token = await makeToken()

    const res  = await POST(makeReq('/api/transactions', {
      token,
      body: { amount: 100, description: 'Teste', type: 'INVALIDO', date: '2024-04-01', categoryId: 'cat-1' },
    }))

    expect(res.status).toBe(400)
  })

  it('retorna 400 com data em formato errado', async () => {
    const token = await makeToken()

    const res  = await POST(makeReq('/api/transactions', {
      token,
      body: { amount: 100, description: 'Teste', type: 'INCOME', date: '01/04/2024', categoryId: 'cat-1' },
    }))

    expect(res.status).toBe(400)
  })
})

// ─── DELETE ─────────────────────────────────────────────────────────────────

describe('DELETE /api/transactions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deleta transação do próprio usuário', async () => {
    const token = await makeToken()
    db.transaction.findFirst.mockResolvedValue(MOCK_TX)
    db.transaction.delete.mockResolvedValue(MOCK_TX)

    const res  = await DELETE(makeReq('/api/transactions?id=tx-1', { token, method: 'DELETE' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(db.transaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-1' } })
  })

  it('retorna 404 se transação não pertence ao usuário', async () => {
    const token = await makeToken()
    db.transaction.findFirst.mockResolvedValue(null)

    const res  = await DELETE(makeReq('/api/transactions?id=tx-999', { token, method: 'DELETE' }))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(db.transaction.delete).not.toHaveBeenCalled()
  })

  it('retorna 400 sem parâmetro id', async () => {
    const token = await makeToken()

    const res  = await DELETE(makeReq('/api/transactions', { token, method: 'DELETE' }))
    const body = await res.json()

    expect(res.status).toBe(400)
  })

  it('retorna 401 sem token', async () => {
    const res = await DELETE(makeReq('/api/transactions?id=tx-1', { method: 'DELETE' }))
    expect(res.status).toBe(401)
  })
})

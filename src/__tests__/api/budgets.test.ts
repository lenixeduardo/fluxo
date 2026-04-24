import { GET, PUT } from '@/app/api/budgets/route'
import { makeReq, makeToken } from '../helpers'

jest.mock('@/lib/db', () => ({
  db: {
    budget: {
      findMany:   jest.fn(),
      upsert:     jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const { db } = require('@/lib/db') as { db: any }

const MOCK_BUDGET = {
  id:         'bud-1',
  amount:     500,
  month:      4,
  year:       2024,
  createdAt:  new Date(),
  updatedAt:  new Date(),
  userId:     'user-1',
  categoryId: 'cat-1',
  category:   { id: 'cat-1', name: 'Alimentação', icon: '🍔', color: '#F00', type: 'EXPENSE' },
}

// ─── GET ────────────────────────────────────────────────────────────────────

describe('GET /api/budgets', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retorna orçamentos do mês atual com token válido', async () => {
    const token = await makeToken()
    db.budget.findMany.mockResolvedValue([MOCK_BUDGET])

    const res  = await GET(makeReq('/api/budgets', { token }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body[0].id).toBe('bud-1')
    expect(body[0].amount).toBe(500)
  })

  it('retorna lista vazia quando não há orçamentos', async () => {
    const token = await makeToken()
    db.budget.findMany.mockResolvedValue([])

    const res  = await GET(makeReq('/api/budgets', { token }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([])
  })

  it('retorna 401 sem token', async () => {
    const res = await GET(makeReq('/api/budgets'))
    expect(res.status).toBe(401)
  })
})

// ─── PUT ────────────────────────────────────────────────────────────────────

describe('PUT /api/budgets', () => {
  beforeEach(() => jest.clearAllMocks())

  it('salva orçamentos válidos via upsert', async () => {
    const token = await makeToken()
    db.$transaction.mockResolvedValue([])
    db.budget.findMany.mockResolvedValue([MOCK_BUDGET])

    const res  = await PUT(makeReq('/api/budgets', {
      token,
      method: 'PUT',
      body: [{ categoryId: 'cat-1', amount: 500 }],
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(db.$transaction).toHaveBeenCalledTimes(1)
  })

  it('deleta orçamentos com amount = 0', async () => {
    const token = await makeToken()
    db.$transaction.mockResolvedValue([])
    db.budget.findMany.mockResolvedValue([])

    const res  = await PUT(makeReq('/api/budgets', {
      token,
      method: 'PUT',
      body: [{ categoryId: 'cat-1', amount: 0 }],
    }))

    expect(res.status).toBe(200)
    // deleteMany deve ter sido enfileirado (não upsert)
    expect(db.budget.upsert).not.toHaveBeenCalled()
  })

  it('retorna 401 sem token', async () => {
    const res = await PUT(makeReq('/api/budgets', { method: 'PUT', body: [] }))
    expect(res.status).toBe(401)
  })

  it('retorna 400 com payload inválido', async () => {
    const token = await makeToken()

    const res  = await PUT(makeReq('/api/budgets', {
      token,
      method: 'PUT',
      body: { categoryId: 'cat-1', amount: 500 }, // objeto em vez de array
    }))

    expect(res.status).toBe(400)
  })

  it('aceita array vazio sem erros', async () => {
    const token = await makeToken()
    db.$transaction.mockResolvedValue([])
    db.budget.findMany.mockResolvedValue([])

    const res  = await PUT(makeReq('/api/budgets', {
      token,
      method: 'PUT',
      body: [],
    }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

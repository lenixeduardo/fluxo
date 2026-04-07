# 💚 Fluxo — Finanças Pessoais

> Seu dinheiro, em movimento.

Aplicativo de controle financeiro pessoal mobile-first. Registro de receitas e despesas em 3 toques, categorização automática por IA e orçamentos mensais configuráveis.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Prisma ORM |
| Autenticação | JWT customizado (jose) + bcryptjs |
| IA | Claude Sonnet (`claude-sonnet-4-20250514`) |
| Cache / Estado | useSWR customizado (sem dependência externa) |
| Virtualização | useVirtual customizado (sem dependência externa) |
| PWA | Web App Manifest + Service Worker |
| Deploy | Vercel (frontend) + Supabase (banco) |

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL (recomendado: [Supabase](https://supabase.com) — plano gratuito)
- Chave de API da Anthropic

---

## Setup

```bash
# 1. Clonar e instalar
git clone https://github.com/seu-usuario/fluxo.git
cd fluxo
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com DATABASE_URL, NEXTAUTH_SECRET e ANTHROPIC_API_KEY

# 3. Criar o banco e gerar o cliente Prisma
npm run db:push
npm run db:generate

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

---

## Estrutura de Pastas

```
fluxo/
├── prisma/
│   └── schema.prisma          # Modelos User, Transaction, Category, Budget
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/          # login · register · me
    │   │   ├── transactions/  # GET · POST · DELETE
    │   │   ├── budgets/       # GET · PUT
    │   │   └── ai/classify/   # POST — Claude categorization
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── charts/            # Sparkline · PieChart · BarChart
    │   ├── features/          # Shell · AuthScreen · HomeScreen · TransactionsScreen · ReportsScreen · ProfileScreen
    │   ├── modals/            # AddTransactionModal · BudgetModals
    │   └── ui/                # Icon · Spinner · Skeleton · BottomNav · StatusBars
    ├── contexts/              # AuthContext · BudgetContext · ToastContext
    ├── hooks/                 # useSWR · useVirtual · useAISuggestion
    ├── lib/                   # db · auth · token · anthropic · constants · utils
    └── types/                 # index.ts — tipos compartilhados
```

---

## Deploy (Vercel + Supabase)

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Deploy
vercel

# Configurar env vars no painel da Vercel:
# DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `NEXTAUTH_SECRET` | Segredo JWT (gere com `openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |

---

## Funcionalidades

- ✅ Autenticação com JWT (login, cadastro, sessão persistida)
- ✅ CRUD de transações com mutations otimistas e rollback
- ✅ Orçamentos mensais por categoria (wizard no primeiro login)
- ✅ Categorização automática via Claude Sonnet
- ✅ Lista virtualizada (suporta milhares de itens)
- ✅ PWA instalável com suporte offline
- ✅ Cache SWR com revalidação automática em foco
- ✅ Dark mode nativo

---

## Licença

MIT

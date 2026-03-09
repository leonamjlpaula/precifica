# Precifica — CLAUDE.md

SaaS de precificação para consultórios odontológicos baseado na metodologia VRPO.

## Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Linguagem**: TypeScript estrito
- **Banco de dados**: PostgreSQL via Prisma 6
- **Autenticação**: NextAuth.js v4 (Credentials provider)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Validação**: Zod
- **Exportação**: @react-pdf/renderer (PDF) + xlsx/SheetJS (Excel)

## Comandos principais

```bash
npm run dev          # inicia servidor de desenvolvimento
npm run typecheck    # tsc --noEmit (rodar antes de commitar)
npm run lint         # eslint
npx prisma migrate dev   # aplica migrations
npx prisma db seed       # popula dados padrão VRPO
```

## Arquitetura (Clean Architecture)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # login, cadastro (sem layout de dashboard)
│   ├── (dashboard)/              # área autenticada com sidebar
│   └── api/                      # route handlers (export PDF/Excel, NextAuth)
├── application/
│   ├── interfaces/               # contratos dos repositórios (I*Repository.ts)
│   └── usecases/                 # server actions e use cases de aplicação
├── domain/
│   └── value-objects/            # lógica de domínio pura (ex: CustoFixoPorMinuto)
├── infrastructure/
│   ├── repositories/             # implementações Prisma dos repositórios
│   └── services/                 # serviços externos (PdfExportService, ExcelExportService)
├── presentation/
│   ├── components/               # componentes React (client components)
│   └── hooks/                    # hooks customizados
├── lib/                          # utilitários compartilhados (db.ts, auth.ts, utils.ts)
└── types/                        # augmentações de tipos globais
```

## Padrões de código

### Pages vs Components
- **Pages** (`app/**/page.tsx`): server components. Verificam sessão, buscam dados, passam para client component.
- **Client components**: ficam em `src/presentation/components/`. Recebem dados via props, gerenciam estado local.
- Padrão típico de page: `getServerSession` → redirect se não autenticado → `Promise.all([...actions])` → renderiza client component.

### Server Actions
- Ficam em `src/application/usecases/*Actions.ts` com `'use server'` no topo.
- Retornam `{ success: true }` ou `{ errors: { general: string[] } }`.
- Validação com Zod antes de qualquer operação no banco.
- Ownership sempre verificado: operações de escrita confirmam que o recurso pertence ao `userId`.

### Repositórios
- Interface em `src/application/interfaces/I*Repository.ts`.
- Implementação Prisma em `src/infrastructure/repositories/Prisma*Repository.ts`.
- Server actions instanciam o repositório diretamente (sem injeção de dependência formal).

### Autenticação
- `getServerSession(authOptions)` em server components/actions para obter userId.
- Middleware em `src/middleware.ts` protege `/dashboard/:path*`.
- Sessão JWT contém `userId` e `name`.

### Fórmula VRPO (núcleo do negócio)
O cálculo de preço de procedimento é:
```
precoFinal = (tempoMinutos × custoFixoPorMinuto) + custoVariavel
custoVariavel = Σ (material.preco / divisor) × consumoNumerico
custoFixoPorMinuto = custoFixoBase + depreciacao + remuneracao + taxaRetorno
```
Implementado em `src/domain/value-objects/CustoFixoPorMinuto.ts` e `src/application/usecases/calcularPrecoProcedimento.ts`.

## Banco de dados

- Prisma schema em `prisma/schema.prisma`.
- Todos os modelos usam `cuid()` como PK.
- Multi-tenancy por `userId` em todos os modelos (User → CustoFixoConfig, Material, Procedimento, Snapshot).
- `Especialidade` e `VRPOReferencia` são dados globais (sem userId).
- Seed em `prisma/seed.ts`: 11 especialidades, 75 VRPOReferencias, 30 materiais padrão, 40 procedimentos padrão.

## Variáveis de ambiente

```env
DATABASE_URL=       # PostgreSQL connection string
NEXTAUTH_SECRET=    # segredo JWT do NextAuth
NEXTAUTH_URL=       # URL base da aplicação (ex: http://localhost:3000)
```

## Limites e regras de negócio

- Máximo 10 snapshots por usuário.
- Apenas itens `isCustom: true` podem ser excluídos (custos fixos, materiais, procedimentos).
- `deleteMaterial` bloqueia se o material está em uso em algum `ProcedimentoMaterial`.
- Números decimais brasileiros (vírgula) são tratados em `parseConsumoNumerico` no use case de procedimentos.

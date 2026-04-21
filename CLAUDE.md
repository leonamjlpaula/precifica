# OdontoValor — CLAUDE.md

SaaS de precificação para consultórios odontológicos brasileiros. Posicionamento central: **"Configure em 10 minutos e saiba se está no lucro ou no prejuízo em cada procedimento."**

---

## Documentação essencial

Antes de qualquer tarefa de produto, leia:

- `PRD.md` — visão do produto, perfis de usuário, funcionalidades, fórmulas completas
- `ARCHITECTURE.md` — stack, estrutura de diretórios, modelo de dados, padrões de código
- `ROADMAP.md` — 6 fases priorizadas, esforço, critérios de "feito" e dependências
- `references/analise-fase1.md` a `analise-fase5.md` — análise profunda das duas metodologias (CNCC e live da mentora Aline Silva), diagnóstico do MVP e raciocínio por trás de cada decisão do roadmap

---

## Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Linguagem**: TypeScript estrito
- **Banco de dados**: PostgreSQL via Prisma 6 + Supabase (PgBouncer transaction pooler na porta 6543)
- **Autenticação**: Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Validação**: Zod
- **Exportação**: @react-pdf/renderer (PDF) + xlsx/SheetJS (Excel)

---

## Comandos principais

```bash
npm run dev              # inicia servidor de desenvolvimento
npm run typecheck        # tsc --noEmit (rodar antes de commitar)
npm run lint             # eslint
npm run format:check     # prettier --check
npm run format           # prettier --write (corrige formato)
npm run prisma:migrate   # aplica migrations usando .env.local
npm run prisma:seed      # popula dados padrão VRPO usando .env.local
```

### Pré-PR obrigatório

Antes de abrir qualquer PR (`gh pr create`), rodar:

```bash
npm run typecheck && npm run lint && npm run format:check
```

Enforçado via hook `PreToolUse` em `.claude/settings.json` — se qualquer check falhar, o `gh pr create` é bloqueado. Ajustar código ou rodar `npm run format` antes de tentar de novo.

### Nomenclatura de branch/worktree

Ao iniciar trabalho em uma issue, renomear a branch/worktree auto-gerada (`claude/<adjetivo>-<nome>-<hash>`) para o padrão do ticket **antes do primeiro commit**:

```
feat/<N>-<slug-curto>       # nova feature — N = número da issue
fix/<N>-<slug-curto>        # bugfix
chore/<N>-<slug-curto>      # infra, deps, config
refactor/<N>-<slug-curto>   # refactor sem mudança de comportamento
```

`<slug-curto>`: kebab-case, 2–4 palavras, derivado do título da issue.

Exemplos:
- Issue #9 "Tooltip de glossário" → `feat/9-glossary-tooltip`
- Issue #13 "Usar parseBR nas server actions" → `refactor/13-parse-br-actions`

```bash
git branch -m <nome-antigo> <nome-novo>
```

**Sem ticket associado:** manter o nome auto-gerado do worktree — não inventar número.

---

## Metodologia de precificação (contexto crítico)

O produto implementa metodologia híbrida de duas fontes:

**CNCC/VRPO:** Metodologia oficial da Comissão Nacional de Convênios e Credenciamentos. Define 14 itens de custo fixo padrão, depreciação de equipamentos (sobre **11 meses** — 1 mês de férias), remuneração profissional com encargos (fundo de reserva 11% + insalubridade 40% + imprevistos 20% + férias + 13º), e taxa de retorno de 3% do investimento em 3 anos. Resultado final da planilha original: R$ 2,475/min com os dados de exemplo.

**Gestão financeira moderna (mentora Aline Silva):** Itens ausentes na CNCC que distorcem o cálculo para a realidade atual:

- **Número de cadeiras:** o custo fixo é dividido pelas cadeiras ativas da clínica
- **Taxa de ociosidade:** minutos úteis reais = teóricos × (1 − ociosidade%). Padrão sugerido: 20%
- **Impostos sobre faturamento como % do preço** (não custo fixo): ISS/Simples varia entre 6–16%
- **Taxa de cartão como % do preço:** ~3–5% no Brasil atual
- **Margem de lucro alvo: 30%** — benchmark explícito da mentora. Procedimento abaixo disso está no "amarelo" ou "vermelho"

**Fórmula completa (ver PRD.md para detalhes):**

```
minutosUteis = diasUteis × horasTrabalho × 60 × (1 − ociosidade/100)
custoBase = totalItens / (minutosUteis × numeroCadeiras)
depreciacao = investimento / (anosDepreciacao × 11 × minutosUteis)
remuneracao = salarioBase × (1 + encargos%) / minutosUteis
custoFixoPorMinuto = custoBase + depreciacao + remuneracao + taxaRetorno

margemLucro = (precoVenda − custoBreakEven − precoVenda × (impostos + cartao) / 100) / precoVenda
precoMinimo30% = custoBreakEven / (1 − (impostos + cartao)/100 − 0.30)
```

---

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
│   └── value-objects/            # lógica de domínio pura (CustoFixoPorMinuto.ts)
├── infrastructure/
│   ├── repositories/             # implementações Prisma dos repositórios
│   └── services/                 # serviços externos (PdfExportService, ExcelExportService)
├── presentation/
│   ├── components/               # componentes React (client components)
│   └── hooks/                    # hooks customizados
├── lib/                          # utilitários compartilhados (db.ts, supabase/server.ts, utils.ts)
│   └── referenceData.ts          # getEspecialidades + getVrpoRefs com unstable_cache (24h)
└── types/                        # augmentações de tipos globais
```

---

## Padrões de código

### Pages vs Components

- **Pages** (`app/**/page.tsx`): server components. Verificam sessão, buscam dados, passam para client component.
- **Client components**: ficam em `src/presentation/components/`. Recebem dados via props, gerenciam estado local.
- Padrão típico de page: `getAuthUserId()` → redirect se não autenticado → `Promise.all([...actions])` → renderiza client component.

### Caching

- **`React cache()`** — deduplicação por request. Usado em `calcularCustoFixoPorMinuto` e `getPercConfig`.
- **`unstable_cache` (next/cache)** — persistência cross-request (Data Cache). Usado em `src/lib/referenceData.ts` (especialidades e refs VRPO, TTL 24h) e na config do usuário (por userId, invalidada via `revalidateTag`).
- **Padrão de invalidação**: mutations em `custoFixoActions.ts` chamam `revalidateTag('config-{userId}')` para forçar recálculo no próximo request.
- Dados globais (`Especialidade`, `VRPOReferencia`) nunca mudam em produção — cacheados sem tag, apenas TTL.

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

- `getAuthUserId()` de `@/lib/supabase/server` em server components/actions para obter userId.
- Middleware em `src/middleware.ts` protege todas as rotas autenticadas: `/dashboard`, `/custos-fixos`, `/materiais`, `/procedimentos`, `/comparativo-vrpo`, `/historico`, `/exportar`, `/primeiros-passos`, `/simulador`, `/conta`.
- Middleware usa `supabase.auth.getSession()` (lê JWT do cookie sem roundtrip). Server components usam `getAuthUserId()` que chama `getUser()` para validação segura com o servidor Supabase.
- Variáveis necessárias: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.

---

## Banco de dados

- Prisma schema em `prisma/schema.prisma`.
- Todos os modelos usam `cuid()` como PK.
- Multi-tenancy por `userId` em todos os modelos.
- `Especialidade` e `VRPOReferencia` são dados globais (sem userId).
- Seed global em `prisma/seed.ts`: especialidades e VRPOReferencias.
- Seed por usuário em `src/lib/vrpo-seed-data.ts`: materiais, procedimentos e itens de custo fixo padrão — chamado no `createUser`.

**Campos adicionados nas Fases 1, 2 e 3** (já existem no schema):

- `CustoFixoConfig.numeroCadeiras` (Int, default 1) — Fase 1
- `CustoFixoConfig.percOciosidade` (Float, default 0) — Fase 1
- `CustoFixoConfig.percImpostos` (Float, default 8) — Fase 1
- `CustoFixoConfig.percTaxaCartao` (Float, default 4) — Fase 1
- `Procedimento.precoVenda` (Float?, nullable) — Fase 2: preço de venda configurado pelo dentista; quando null, margem não é calculável
- `Procedimento.custoLaboratorio` (Float?, default 0) — Fase 3: custo de laboratório (coroas, próteses, facetas, aparelhos ortodônticos)

---

## Estado atual do produto (diagnóstico)

**Fundação técnica:** sólida. Arquitetura limpa, autenticação completa (incluindo recuperação de senha), CRUD de materiais/procedimentos/custos fixos, comparativo VRPO, snapshots, exportação PDF/Excel, onboarding wizard.

**Fases concluídas:**

- **Fase 1 ✅** — Correções de cálculo: depreciação/retorno com 11 meses (CNCC), número de cadeiras, taxa de ociosidade, percImpostos e percTaxaCartao no config.
- **Fase 2 ✅** — Margem de lucro visível: campo `precoVenda` no Procedimento, badge verde/amarelo/vermelho na listagem, cards de margem e preço mínimo para 30% no detalhe, dashboard com "Procedimentos no Vermelho", alerta pós-save com contagem de procedimentos afetados.
- **Fase 3 ✅** — Seed completo: 200 procedimentos, 134 materiais, composições pré-configuradas, `custoLaboratorio` em prótese/endo/ortod, 200 valores VRPO atualizados. Performance: `contarProcedimentosNoVermelho` reescrito com select mínimo; query serial de config em `getProcedimentosNoVermelho` movida para `Promise.all`.
- **Fase 4 ✅** — Onboarding adaptativo: wizard com passo 0 de perfil (solo/clínica), passo explicativo de rateio por cadeiras para clínicas. Dashboard: seção "Atenção necessária" (procedimentos no vermelho, custos desatualizados, ociosidade não configurada), card de faturamento mínimo semanal (break-even ÷ 4), framing do comparativo VRPO como margem de negociação.
- **Fase 5 ✅** — Simulador de cenários (`/simulador`): ajuste client-side de custo fixo total, cadeiras, ociosidade, impostos e taxa de cartão com impacto em tempo real no custo/min e margem por procedimento. PDF de credenciamento com memória completa de cálculo (itens, depreciação, remuneração, retorno) e metodologia CNCC referenciada. Histórico: diff estruturado dos itens de custo fixo entre snapshots. Correção: query duplicada em `compareSnapshotWithCurrent` eliminada (usava `currentData.custoFixoItems` retornado por `gerarSnapshot`).

**Próximo passo:** ver `ROADMAP.md` — Fase 6 (Segurança + LGPD + Analytics).

---

## Ambientes

Dev e prod apontam para o **mesmo Supabase** — não há banco Docker local para o app. O Docker Compose sobe um PostgreSQL auxiliar para testes locais sem Supabase, mas o fluxo padrão usa Supabase direto.

| Variável                               | Descrição                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | Transaction Pooler porta 6543 — `?pgbouncer=true&connection_limit=1` obrigatório |
| `DIRECT_URL`                           | Direct connection porta 5432 — usado pelo `prisma migrate`                       |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL do projeto Supabase (`https://xxxx.supabase.co`)                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (prefixo `sb_publishable_`)                                      |
| `SUPABASE_SECRET_KEY`                  | Secret key — **nunca expor no client** nem em variável `NEXT_PUBLIC_`            |

**Setup dev:**

```bash
cp .env.example .env.local   # preencher com valores do painel Supabase
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Email:** Confirmação de cadastro gerenciada pelo Supabase Auth. Para configurar provedor custom: `Supabase Dashboard → Project Settings → Auth → SMTP Settings`.

**Deploy:** `vercel.json` com `regions: ["gru1"]` (São Paulo) — co-localizado com Supabase `aws-1-sa-east-1`.

---

## Limites e regras de negócio

- Máximo 10 snapshots por usuário.
- Apenas itens `isCustom: true` podem ser excluídos (custos fixos, materiais, procedimentos).
- `deleteMaterial` bloqueia se o material está em uso em algum `ProcedimentoMaterial`.
- Números decimais brasileiros (vírgula) são tratados em `parseConsumoNumerico` no use case de procedimentos.
- A depreciação e a taxa de retorno usam 11 meses por ano (CNCC), não 12.
- Margem de lucro alvo: 30% (verde ≥30%, amarelo 10–29%, vermelho <10%).

---

## O que evitar

- Não implementar features do roadmap sem ler o `ROADMAP.md` primeiro — a ordem das fases tem dependências explícitas.
- Não alterar a fórmula de `CustoFixoPorMinuto.ts` sem confirmar que o resultado com os dados padrão da CNCC ainda é R$ 2,475/min.
- Não usar 12 meses na depreciação — a metodologia CNCC usa 11 (1 mês de férias).
- Não tratar impostos (ISS/Simples) como custo fixo — eles são percentuais variáveis sobre o preço de venda.
- Não "melhorar" código adjacente sem necessidade — as tarefas são focadas e incrementais.

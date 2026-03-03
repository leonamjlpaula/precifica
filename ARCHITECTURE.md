# Arquitetura do Precifica

## Visão Geral

O **Precifica** é uma aplicação SaaS de precificação odontológica baseada na metodologia VRPO da CNCC. Permite que dentistas configurem custos fixos, precifiquem materiais e procedimentos, e comparem seus preços com a tabela de referência nacional.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TailwindCSS 3 + Radix UI |
| Linguagem | TypeScript 5 (strict) |
| ORM | Prisma 6 |
| Banco de Dados | PostgreSQL |
| Autenticação | NextAuth.js 4 (Credentials + JWT) |
| Validação | Zod 3 |
| Ícones | Lucide React |
| Variantes de estilo | Class Variance Authority (CVA) |
| Export PDF | @react-pdf/renderer |
| Export Excel | XLSX |

---

## Estrutura de Diretórios

```
src/
├── app/                        # Rotas (Next.js App Router)
│   ├── (auth)/                 # Rotas públicas
│   │   ├── login/
│   │   └── cadastro/
│   ├── (dashboard)/            # Rotas protegidas
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── custos-fixos/
│   │   ├── materiais/
│   │   ├── procedimentos/[especialidade]/[id]/
│   │   ├── comparativo-vrpo/
│   │   ├── historico/
│   │   ├── exportar/
│   │   └── primeiros-passos/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── export/{excel,pdf}/
│   └── layout.tsx              # Root layout
│
├── application/                # Casos de uso e interfaces
│   ├── interfaces/             # Contratos de repositório
│   │   ├── IMaterialRepository.ts
│   │   ├── IProcedimentoRepository.ts
│   │   └── ICustoFixoRepository.ts
│   └── usecases/               # Server Actions
│       ├── materialActions.ts
│       ├── procedimentoActions.ts
│       ├── custoFixoActions.ts
│       ├── calcularCustoFixoPorMinuto.ts
│       ├── calcularPrecoProcedimento.ts
│       ├── dashboardActions.ts
│       ├── createUser.ts
│       ├── onboardingActions.ts
│       ├── snapshotActions.ts
│       ├── exportActions.ts
│       └── comparativoActions.ts
│
├── domain/
│   └── value-objects/
│       └── CustoFixoPorMinuto.ts   # Lógica de cálculo pura
│
├── infrastructure/
│   ├── repositories/           # Implementações Prisma
│   │   ├── PrismaMaterialRepository.ts
│   │   ├── PrismaProcedimentoRepository.ts
│   │   └── PrismaCustoFixoRepository.ts
│   └── services/               # Serviços externos
│       ├── ExcelExportService.ts
│       └── PdfExportService.tsx
│
├── presentation/
│   ├── components/
│   │   ├── ui/                 # Componentes base (Shadcn-style)
│   │   ├── layout/             # DashboardLayout, OnboardingWizard
│   │   ├── dashboard/
│   │   ├── materiais/
│   │   ├── procedimentos/
│   │   ├── custos-fixos/
│   │   ├── comparativo-vrpo/
│   │   ├── historico/
│   │   ├── exportar/
│   │   └── primeiros-passos/
│   └── hooks/
│       └── use-toast.ts
│
├── lib/
│   ├── auth.ts                 # Configuração NextAuth
│   ├── db.ts                   # Singleton Prisma Client
│   ├── utils.ts                # Funções auxiliares
│   └── vrpo-seed-data.ts       # Dados padrão para novos usuários
│
├── types/
│   └── next-auth.d.ts          # Extensão de tipos NextAuth
│
└── middleware.ts               # Proteção de rotas
```

---

## Camadas da Arquitetura

O projeto segue uma arquitetura em camadas inspirada em Clean Architecture / Arquitetura Hexagonal.

```
┌──────────────────────────────────────────┐
│           PRESENTATION                   │
│  Componentes React (Server + Client)     │
│  DashboardLayout, MateriaisTable, etc.   │
└──────────────┬───────────────────────────┘
               │ chama Server Actions
               ↓
┌──────────────────────────────────────────┐
│           APPLICATION                    │
│  Use Cases / Server Actions              │
│  materialActions, procedimentoActions…   │
│  Validação com Zod                       │
└──────┬───────────────────────────────────┘
       │ usa interfaces (contratos)
       ↓
┌─────────────┐      ┌───────────────────────┐
│   DOMAIN    │      │    INFRASTRUCTURE     │
│             │      │                       │
│ CustoFixo   │      │ PrismaMaterialRepo    │
│ PorMinuto   │      │ PrismaProcedimento    │
│ (cálculo    │      │ Repo                  │
│  puro)      │      │ ExcelExportService    │
│             │      │ PdfExportService      │
└─────────────┘      └───────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       EXTERNAL          │
                    │  Prisma Client          │
                    │  PostgreSQL             │
                    └─────────────────────────┘
```

### Por que essa separação?

- **Domain** contém lógica de negócio pura, sem dependências externas — testável de forma isolada.
- **Application** orquestra o fluxo: valida entrada, aciona repositórios, retorna resultado tipado.
- **Infrastructure** isola o Prisma; trocar o banco ou a lib de ORM não exige mudanças na lógica de negócio.
- **Presentation** recebe dados prontos do servidor e cuida apenas da UI e interatividade.

---

## Modelo de Dados (Prisma)

```
User
 ├── CustoFixoConfig (1:1)
 │    └── CustoFixoItem[] (1:N)
 ├── Material[] (1:N)
 │    └── ProcedimentoMaterial[] (N:M com Procedimento)
 ├── Procedimento[] (1:N)
 │    ├── Especialidade (N:1)
 │    └── ProcedimentoMaterial[] (N:M com Material)
 └── Snapshot[] (1:N)

VRPOReferencia          — tabela de referência nacional (sem FK para User)
Especialidade           — categorias de procedimentos (sem FK para User)
```

**Pontos de destaque:**
- Todos os dados operacionais têm `userId` — multitenancy por coluna.
- `Snapshot.dados` é `Json` — salva o estado inteiro de precificação num instante.
- `Procedimento` tem `@@unique([userId, codigo])` — código único por usuário.
- `VRPOReferencia` é global e somente leitura pela aplicação.

---

## Autenticação e Autorização

**Estratégia:** NextAuth.js com Credentials Provider + JWT.

```
1. Login → Credentials provider valida email + bcrypt(senha)
2. JWT callback → adiciona userId ao token
3. Session callback → expõe userId em session.user
4. middleware.ts → withAuth() bloqueia /dashboard/* sem sessão válida
5. Páginas server-side → getServerSession() para verificação adicional
6. Server Actions → recebem userId como parâmetro e verificam ownership no DB
```

**Arquivos:**
- `src/lib/auth.ts` — NextAuthOptions
- `src/middleware.ts` — proteção de rotas
- `src/types/next-auth.d.ts` — tipagem de Session e JWT

---

## Divisão Server / Client Components

| Tipo | Onde | Responsabilidade |
|---|---|---|
| Server Component | `src/app/(dashboard)/*/page.tsx` | Busca dados, verifica sessão, passa props |
| Client Component | `src/presentation/components/**/*.tsx` | Estado local, formulários, transições |
| Server Action | `src/application/usecases/*.ts` | Mutações, validação, acesso ao banco |

**Padrão de fluxo de dados:**

```
page.tsx (Server)
  └─ busca dados via Server Actions
  └─ renderiza ↓

FooPage.tsx ('use client')
  └─ recebe props do servidor
  └─ gerencia estado local (useState)
  └─ chama Server Actions em mutações (useTransition)
  └─ exibe feedback via toast
```

---

## Fórmula de Precificação (Lógica Central)

```
Preço Final = (Tempo em minutos × Custo Fixo/min) + Custo Variável
```

- **Custo Fixo/min** → calculado por `CustoFixoPorMinuto` (domain) a partir de `CustoFixoConfig`
- **Custo Variável** → soma dos materiais do procedimento × (preço / divisor)
- **VRPO** → valor de referência nacional buscado em `VRPOReferencia` para comparação

---

## Padrões Recorrentes

### Server Action com validação Zod
```ts
'use server'
export async function createMaterial(userId: string, nome: string, preco: number) {
  const schema = z.object({ nome: z.string().min(1), preco: z.number().positive() })
  const result = schema.safeParse({ nome, preco })
  if (!result.success) return { errors: result.error.flatten().fieldErrors }
  // persiste no banco
  return { success: true, data: material }
}
```

### Componente client com transição
```ts
'use client'
const [isPending, startTransition] = useTransition()
startTransition(async () => {
  const result = await createMaterial(userId, nome, preco)
  if (result.errors) { /* exibe erros */ }
  else { toast({ title: 'Material criado' }) }
})
```

### Repositório com interface
```ts
// Interface (application/interfaces)
interface IMaterialRepository {
  listByUserId(userId: string): Promise<Material[]>
  updatePrice(id: string, preco: number): Promise<void>
}

// Implementação (infrastructure/repositories)
class PrismaMaterialRepository implements IMaterialRepository {
  listByUserId(userId: string) {
    return prisma.material.findMany({ where: { userId } })
  }
}
```

---

## Funcionalidades Principais

| Funcionalidade | Rota | Descrição |
|---|---|---|
| Dashboard | `/dashboard` | Resumo estatístico e alertas de precificação |
| Custos Fixos | `/custos-fixos` | Configuração de aluguel, salários, equipamentos |
| Materiais | `/materiais` | Catálogo de insumos com preços atualizáveis |
| Procedimentos | `/procedimentos/:especialidade` | Lista e edição de procedimentos com cálculo |
| Comparativo VRPO | `/comparativo-vrpo` | Comparação com a tabela de referência nacional |
| Histórico | `/historico` | Snapshots salvos para análise temporal |
| Exportar | `/exportar` | Geração de PDF e planilha Excel |
| Primeiros Passos | `/primeiros-passos` | Guia educativo sobre o sistema |

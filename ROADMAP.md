# Roadmap do OdontoValor

Priorização em dois eixos: **correção do produto** (bugs de cálculo que produzem números errados) e **retenção do primeiro usuário** (dentista que cria conta e não encontra seus procedimentos vai embora antes de sentir o valor). Fases independentes e entregáveis de forma isolada.

---

## Fase 1 — Correções de Cálculo (Fundação Metodológica) ✅

**Objetivo:** Garantir que os números produzidos são matematicamente corretos para todos os perfis de usuário, conforme a metodologia CNCC e os conceitos da gestão financeira moderna.

**Esforço estimado:** 1–2 dias de desenvolvimento.

**Entregáveis:**

1. ✅ Corrigir depreciação e taxa de retorno para usar 11 meses em `CustoFixoPorMinuto.ts` (hoje usa 12 — bug silencioso vs. metodologia CNCC).
2. ✅ Adicionar campo `numeroCadeiras` (Int, default 1) em `CustoFixoConfig`. Custo base dividido por esse valor.
3. ✅ Adicionar campo `percOciosidade` (Float, default 0) em `CustoFixoConfig`. Minutos úteis = `diasUteis × horasTrabalho × 60 × (1 − ociosidade/100)`. Default 0 preserva comportamento atual; nudge no dashboard sugere configurar para 20%.
4. ✅ Adicionar campos `percImpostos` (Float, default 8) e `percTaxaCartao` (Float, default 4) em `CustoFixoConfig`. Usados no cálculo de margem (não no custo/min).
5. ✅ Migration Prisma com os novos campos e defaults.
6. ✅ Atualizar formulário de Custos Fixos para expor os novos campos com tooltips explicativos.

**Dependências:** Nenhuma.

**Critério de "feito":** ✅ Com os dados da planilha CNCC (R$ 13.528,36 de custos, R$ 35.980,32 de equipamentos, salário R$ 6.000 com encargos originais, 1 cadeira, 0% ociosidade), o sistema produz R$ 2,475/min — idêntico à planilha.

---

## Fase 2 — Margem de Lucro Visível ✅

**Objetivo:** Cada procedimento exibe sua margem percentual com indicador visual. O sistema sugere preço mínimo para 30% de margem. Esta é a feature que muda a proposta de valor central de "calculadora de custo" para "ferramenta de decisão".

**Esforço estimado:** 3–4 dias de desenvolvimento.

**Entregáveis:**

1. ✅ Expandir `calcularPrecoProcedimento` com `margemLucro` e `precoMinimoParaMargem30`.
2. ✅ Coluna "Margem" na listagem de procedimentos por especialidade: badge verde (≥30%), amarelo (10–29%), vermelho (<10%).
3. ✅ Margem e preço mínimo no detalhe do procedimento.
4. ✅ Dashboard: substituir "5 procedimentos com menor margem vs. VRPO" por "procedimentos no vermelho" (baseado em margem real).
5. ✅ Alerta pós-save: ao salvar custos fixos ou preço de material, exibir toast "X procedimentos ficaram abaixo de 30% de margem" com link.

**Dependências:** Fase 1 (campos `percImpostos` e `percTaxaCartao` precisam existir).

**Critério de "feito":** ✅ Procedimento com preço R$ 280, custos R$ 243, impostos 8%, cartão 4% → margem exibida ≈ 8,4% (vermelho). Preço mínimo para 30% exibido = R$ 415.

---

## Fase 3 — Seed Completo e Fidedigno ✅

**Objetivo:** Todo dentista que cria conta encontra seus procedimentos pré-configurados. Sem isso, o onboarding promete "10 minutos" mas entrega um sistema vazio.

**Entregáveis:**

1. ✅ 200 procedimentos VRPO reais em `vrpo-seed-data.ts`, cobrindo todas as 11 especialidades com códigos, nomes e tempos padrão.
2. ✅ 134 materiais com preços de referência do mercado nacional atual, organizados em 15 grupos (anestésicos, resinas, cimentos, endodônticos, perio/cirurgia, implantodontia, ortodontia, EPI, etc.).
3. ✅ Composição completa de materiais pré-configurada nos procedimentos mais frequentes de cada especialidade.
4. ✅ 200 valores VRPO atualizados em `prisma/seed.ts`, cobrindo todos os procedimentos do seed (substituíram as ~65 estimativas anteriores).
5. ✅ Campo `custoLaboratorio` em `Procedimento` (migration aplicada) + valores de referência em prótese (coroas PFM/Zircônia, PPF, PPR, overdenture, facetas), endodontia (espigão de fibra) e ortodontia (aparelhos, mantenedor de espaço).
6. ⏭ Script de importação a partir de planilha — adiado; não é bloqueador para o lançamento.

**Critério de "feito":** ✅ Dentista generalista cria conta e encontra seus procedimentos do dia-a-dia pré-configurados, com margem calculada automaticamente sem entrada manual além dos custos fixos.

---

## Fase 4 — Onboarding Adaptativo e Dashboard de Diagnóstico ✅

**Objetivo:** O primeiro login entrega valor em menos de 10 minutos. O dashboard responde "o que precisa de atenção agora?" sem que o dentista precise navegar.

**Esforço estimado:** 3–4 dias de desenvolvimento.

**Entregáveis:**

1. ✅ Wizard reformulado com pergunta inicial de perfil: "Atende sozinho(a) ou divide o espaço com outros dentistas?" — dois fluxos distintos.
2. ✅ Para perfil clínica: step explicativo sobre divisão de cadeiras com exemplo numérico antes do formulário.
3. ✅ Seção "Atenção necessária" no dashboard (aparece somente com alertas ativos): procedimentos no vermelho, custos desatualizados há mais de 6 meses, taxa de ociosidade não configurada.
4. ✅ Card "Faturamento mínimo semanal" (break-even ÷ 4) no dashboard.
5. ✅ Refatorar framing do comparativo VRPO: "margem para negociação" em vez de julgamento puro; texto explicativo sobre uso em credenciamento.

**Dependências:** Fases 1, 2 e 3.

**Critério de "feito":** ✅ Dentista solo cria conta, completa o wizard e vê a margem dos seus procedimentos em menos de 10 minutos — medido em teste com usuário real.

---

## Fase 5 — Simulador de Cenários e Exportação Profissional ✅

**Objetivo:** Transformar o produto em ferramenta de decisão e de negociação — as features que justificam a assinatura para dentistas que já têm suas planilhas funcionando.

**Esforço estimado:** 4–6 dias de desenvolvimento.

**Entregáveis:**

1. ✅ Simulador de cenários: painel lateral em `/simulador` que permite ajustar variáveis de custo (custo fixo total, cadeiras, ociosidade, % impostos) sem salvar, exibindo impacto em tempo real no custo/min e na margem dos procedimentos. Inteiramente client-side.
2. ✅ PDF de credenciamento: novo template de exportação com memória de cálculo do custo fixo por minuto (cada item, depreciação, remuneração, retorno) e metodologia CNCC referenciada.
3. ✅ Narrativa no histórico: diff estruturado dos itens de custo que mudaram entre snapshots ("aluguel: R$ 2.500 → R$ 3.200").

**Dependências:** Fase 4.

**Critério de "feito":** ✅ Dentista ajusta aluguel no simulador e vê imediatamente quantos procedimentos cruzam para o vermelho, sem salvar. PDF de credenciamento com metodologia CNCC completa disponível na página de exportação.

---

## Fase 6 — Qualidade, Segurança e Observabilidade

**Objetivo:** Garantir que a aplicação é segura, observável e em conformidade com LGPD antes de qualquer usuário real externo.

**Esforço estimado:** 3–5 dias

**Entregáveis:**

*Infraestrutura e performance:*
1. Índices Prisma explícitos em `procedimento.userId`, `material.userId` e `procedimento.especialidadeId` — são os filtros presentes em todas as queries principais.
2. Consolidar `getLastUpdateInfo` no dashboard reutilizando resultado já buscado em `getDashboardStats`, eliminando query redundante.
3. Extrair `getPercConfig` para módulo compartilhado em `src/lib/` — o helper lê `percImpostos`/`percTaxaCartao` e está duplicado em `procedimentoActions.ts` e `dashboardActions.ts`.

*Segurança:*
4. Headers HTTP de segurança em `next.config.ts`: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`.
5. Auditoria sistemática de IDOR: revisar todos os server actions e route handlers — confirmar que toda operação de leitura e escrita valida `userId` da sessão antes de acessar o banco.
6. Rate limiting no endpoint de autenticação (Upstash Ratelimit ou middleware Vercel) para proteção contra brute force.
7. Confirmar que `SUPABASE_SECRET_KEY` nunca é referenciada em código de client component nem em variável com prefixo `NEXT_PUBLIC_`.

*LGPD e compliance:*
8. Feature de exclusão de conta e dados (direito ao esquecimento): server action que deleta em cascata todos os dados do usuário — procedimentos, materiais, configurações, snapshots — e então remove o registro `User` e o usuário no Supabase Auth.
9. Cookie consent banner obrigatório antes de ativar cookies de terceiros (necessário para Posthog). Deve persistir preferência do usuário.
10. Documentar no schema Prisma quais campos de `User` são dados pessoais e por quanto tempo são retidos após cancelamento/exclusão.

*Observabilidade:*
11. Setup Sentry (`@sentry/nextjs`): captura de exceções em server actions e route handlers com contexto de usuário (sem PII sensível).
12. Setup Vercel Analytics: ativar no projeto Vercel (zero-config, sem código adicional).
13. Setup Posthog: identificar usuário após login (`posthog.identify`), capturar eventos em ações-chave — procedimento criado, custo salvo, PDF exportado, simulador usado, snapshot gerado.

**Dependências:** Nenhuma (pode rodar imediatamente após Fase 5).

**Critério de "feito":** Headers de segurança verificáveis via securityheaders.com com nota ≥ B; Sentry recebendo eventos de erro de teste; Posthog registrando sessão e eventos de usuário de teste; feature de exclusão de conta remove todos os dados em cascata; cookie consent funcional.

---

## Fase 7 — Autenticação Social, Suporte e Engajamento

**Objetivo:** Reduzir fricção no cadastro, criar canal direto de contato com usuários e sinalizar que o produto está em evolução ativa.

**Esforço estimado:** 2–3 dias

**Entregáveis:**

1. **Login social com Google** via Supabase OAuth: botão "Entrar com Google" nas telas de login e cadastro; no primeiro login social, criar registro em `User` com `nome` vindo do perfil Google e `onboardingCompleted: false` para acionar o wizard normalmente.
2. **Área de suporte** (`/suporte`) acessível pela sidebar e pela futura área do usuário:
   - Formulário com campos: nome (pré-preenchido), email (pré-preenchido), categoria (Problema técnico / Dúvida / Sugestão / Solicitar nova funcionalidade), mensagem livre.
   - Envio via API route para email de suporte (Resend ou Supabase Edge Function).
   - Link alternativo para WhatsApp (canal preferido por profissionais de saúde brasileiros).
3. **Seção "Em breve"** como página `/em-breve` ou seção do dashboard:
   - Cards visuais com os itens da Fase 10 (nice-to-haves do produto).
   - Botão "Me avise quando estiver pronto" por card — registra evento no Posthog com nome da feature para medir demanda.
   - Comunica que o produto está sendo desenvolvido ativamente.

**Dependências:** Fase 6 (Posthog deve estar configurado para capturar eventos de interesse).

**Critério de "feito":** Login com Google funcional em produção (inclusive no fluxo de onboarding); formulário de suporte envia email e exibe confirmação; seção "Em breve" no ar com pelo menos 5 features listadas e rastreamento de interesse ativo.

---

## Fase 8 — Monetização

**Objetivo:** Transformar o produto em um negócio — fluxo de trial, cobrança automática, gestão de assinatura e área da conta do usuário.

**Esforço estimado:** 6–10 dias

**Processador de pagamento:** Stripe — suporta BRL, tem o melhor sistema nativo de trial + renovação automática para SaaS, SDK TypeScript de primeira classe para Next.js.

**Modelo:** Trial gratuito de 14 dias com cartão de crédito obrigatório no cadastro → cobrança automática ao fim do trial. Cartão de crédito como único meio de pagamento (garante renovação automática sem intervenção). Preço: R$ 79/mês ou R$ 708/ano (~25% de desconto).

**Entregáveis:**

*Stripe e infraestrutura:*
1. Criar produto e preços no Stripe Dashboard: `price_monthly` (R$ 79/mês recorrente) e `price_annual` (R$ 708/ano recorrente).
2. Instalar SDK `stripe` e configurar variáveis de ambiente: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

*Schema Prisma — novos campos em `User`:*
3. Migration adicionando:
   - `stripeCustomerId String? @unique` — ID do customer no Stripe
   - `stripeSubscriptionId String? @unique` — ID da assinatura ativa
   - `subscriptionStatus String?` — `trialing` | `active` | `past_due` | `canceled` | `incomplete`
   - `trialEndsAt DateTime?` — data de fim do trial
   - `currentPeriodEnd DateTime?` — data da próxima cobrança

*Fluxo de cadastro com trial:*
4. Ao criar conta: criar customer no Stripe → criar subscription com `trial_period_days: 14` e coleta de cartão via Stripe Checkout (modo subscription) ou Stripe Elements.
5. Middleware de proteção por status de assinatura: redirecionar para `/assinar` se `subscriptionStatus` não for `trialing` ou `active`.
6. Página `/assinar` para usuários com trial expirado, cancelado ou sem assinatura: exibe pricing, tabela mensal/anual e CTA de reativação.
7. Banner de aviso no dashboard durante o trial exibindo dias restantes e link para gerenciar assinatura.

*Webhooks:*
8. Route handler `POST /api/stripe/webhook` com verificação de assinatura HMAC:
   - `customer.subscription.updated` → atualiza `subscriptionStatus` e `currentPeriodEnd`
   - `customer.subscription.deleted` → marca como `canceled`
   - `invoice.payment_failed` → marca como `past_due`
   - `invoice.payment_succeeded` → confirma `active`

*Área do usuário (`/conta`):*
9. Página `/conta` acessível pela sidebar (novo item de navegação):
   - **Dados pessoais:** editar nome; visualizar email; alterar senha (redireciona para fluxo Supabase).
   - **Assinatura:** plano atual, status, próxima cobrança, link para portal do cliente Stripe.
   - **Zona de perigo:** excluir conta e todos os dados (usa server action da Fase 6).
10. Integração com portal do cliente Stripe (`stripe.billingPortal.sessions.create`): permite ao usuário trocar cartão, ver histórico de faturas e cancelar sem necessidade de UI customizada.

**Dependências:** Fases 6 e 7 (segurança e LGPD devem estar prontos antes de coletar dados de pagamento; Posthog para rastrear eventos de conversão do trial).

**Critério de "feito":** Usuário consegue se cadastrar com cartão, usar o app por 14 dias em trial, ser cobrado automaticamente ao fim do trial, e gerenciar/cancelar a assinatura pelo portal Stripe. Webhook atualiza `subscriptionStatus` em tempo real. Acesso bloqueado para assinaturas expiradas.

---

## Fase 9 — Aquisição

**Objetivo:** Criar a presença pública do produto — landing page que converte visitantes em trials, documentos legais obrigatórios para operação comercial e estratégia de marketing documentada.

**Esforço estimado:** 4–6 dias

**Entregáveis:**

*Landing page (`/`):*
1. Redesenho completo da rota `/` com seções:
   - **Hero:** headline principal + subheadline + CTA primário "Começar grátis por 14 dias".
   - **Problema:** "Você sabe se está no lucro em cada procedimento?"
   - **Solução:** 3–4 features principais com screenshots reais do app.
   - **Como funciona:** passo a passo em 3 etapas (configure → calcule → decida).
   - **Pricing:** plano único com alternância mensal/anual + CTA + nota sobre trial de 14 dias.
   - **FAQ:** 5–7 perguntas frequentes (cancelamento, segurança dos dados, metodologia de cálculo).
   - **Rodapé:** links para Termos de Uso, Política de Privacidade, suporte e redes sociais.
2. Meta tags Open Graph para compartilhamento em redes sociais (título, descrição, imagem).
3. Structured data `schema.org/SoftwareApplication` para SEO.

*Documentos legais:*
4. Página `/termos-de-uso`: Termos de Uso para SaaS brasileiro — condições do trial, cobrança automática, cancelamento, limitação de responsabilidade, lei aplicável (Brasil).
5. Página `/politica-de-privacidade`: Política de Privacidade em conformidade com LGPD — dados coletados, finalidade, retenção, direitos do titular (acesso, correção, exclusão, portabilidade), contato do responsável pelo tratamento.
6. Checkbox de aceite nos formulários de cadastro e login: "Li e aceito os [Termos de Uso] e a [Política de Privacidade]".

*Marketing:*
7. Arquivo `MARKETING.md` na raiz do projeto com estratégia completa de lançamento:
   - Público-alvo e personas (dentista solo, sócio de clínica, recém-formado)
   - Canais prioritários: Instagram, YouTube (educacional), grupos WhatsApp de dentistas, LinkedIn
   - Estratégia de conteúdo por canal (frequência, formatos, temas)
   - Copy de anúncios (Google Ads: palavras-chave; Meta Ads: criativos)
   - Sequência de email marketing: onboarding (dias 1/3/7), engajamento (dia 10), conversão de trial (dias 12/13/14)
   - Estratégia de obtenção de leads: lead magnet (planilha gratuita de referência VRPO), SEO, parcerias com CROs e faculdades de odontologia
   - Métricas de sucesso: CAC, MRR, taxa de conversão trial→pago, churn mensal

**Dependências:** Fase 8 (o CTA da landing page aponta para o cadastro com Stripe; os Termos devem referenciar as condições reais do trial e do plano de preços).

**Critério de "feito":** Landing page no ar em produção com Lighthouse Performance ≥ 85; Termos de Uso e Política de Privacidade publicados e linkados no rodapé, no cadastro e no login; `MARKETING.md` revisado e aprovado pelo responsável pelo produto.

---

## Fase 10 — Nice-to-haves de Produto (sob demanda)

Sem data comprometida. Ordem de execução determinada pela demanda medida via Posthog e pelos botões "Me avise" da seção "Em breve" (Fase 7).

| Item | Valor |
|---|---|
| Break-even por procedimento ("quantas consultas de X por mês") | Alto |
| Calculadora de pacotes/fidelização | Alto |
| Metas de faturamento mensal | Médio |
| Notificações de revisão por inflação (IPCA) | Médio |
| Área administrativa para atualizar VRPO sem deploy | Médio |
| Múltiplos consultórios | Médio |
| Benchmarks anonimizados de mercado | Alto (requer escala) |
| Relatório para contador (DRE simplificada) | Baixo |
| Integração com agenda para ocupação automática | Alto (requer escala) |

---

## Resumo

| Fase | Foco | Esforço | Status | Depende de |
|---|---|---|---|---|
| 1 | Correções de cálculo | 1–2d | ✅ | — |
| 2 | Margem visível + alertas | 3–4d | ✅ | 1 |
| 3 | Seed completo | 5–8d | ✅ | 1 |
| 4 | Onboarding + dashboard | 3–4d | ✅ | 1+2+3 |
| 5 | Simulador + PDF profissional | 4–6d | ✅ | 4 |
| 6 | Segurança + LGPD + analytics | 3–5d | Pendente | — |
| 7 | Google login + suporte + "em breve" | 2–3d | Pendente | 6 |
| 8 | Stripe + trial + assinatura + /conta | 6–10d | Pendente | 6+7 |
| 9 | Landing page + legal + marketing | 4–6d | Pendente | 8 |
| 10 | Nice-to-haves de produto | Variável | Backlog | Qualquer ordem |

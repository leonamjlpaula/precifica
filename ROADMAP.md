# Roadmap do Precifica

Priorização em dois eixos: **correção do produto** (bugs de cálculo que produzem números errados) e **retenção do primeiro usuário** (dentista que cria conta e não encontra seus procedimentos vai embora antes de sentir o valor). Fases independentes e entregáveis de forma isolada.

Fases 1 e 3 podem rodar em paralelo — cálculo é código, seed é curadoria de dados. Fase 2 depende da 1. Fase 4 depende da 2 e da 3. Fase 5 depende da 4.

---

## Fase 1 — Correções de Cálculo (Fundação Metodológica)

**Objetivo:** Garantir que os números produzidos são matematicamente corretos para todos os perfis de usuário, conforme a metodologia CNCC e os conceitos da gestão financeira moderna.

**Esforço estimado:** 1–2 dias de desenvolvimento.

**Entregáveis:**

1. Corrigir depreciação e taxa de retorno para usar 11 meses em `CustoFixoPorMinuto.ts` (hoje usa 12 — bug silencioso vs. metodologia CNCC).
2. Adicionar campo `numeroCadeiras` (Int, default 1) em `CustoFixoConfig`. Custo base dividido por esse valor.
3. Adicionar campo `percOciosidade` (Float, default 0) em `CustoFixoConfig`. Minutos úteis = `diasUteis × horasTrabalho × 60 × (1 − ociosidade/100)`. Default 0 preserva comportamento atual; nudge no dashboard sugere configurar para 20%.
4. Adicionar campos `percImpostos` (Float, default 8) e `percTaxaCartao` (Float, default 4) em `CustoFixoConfig`. Usados no cálculo de margem (não no custo/min).
5. Migration Prisma com os novos campos e defaults.
6. Atualizar formulário de Custos Fixos para expor os novos campos com tooltips explicativos.

**Dependências:** Nenhuma.

**Critério de "feito":** Com os dados da planilha CNCC (R$ 13.528,36 de custos, R$ 35.980,32 de equipamentos, salário R$ 6.000 com encargos originais, 1 cadeira, 0% ociosidade), o sistema produz R$ 2,475/min — idêntico à planilha.

---

## Fase 2 — Margem de Lucro Visível

**Objetivo:** Cada procedimento exibe sua margem percentual com indicador visual. O sistema sugere preço mínimo para 30% de margem. Esta é a feature que muda a proposta de valor central de "calculadora de custo" para "ferramenta de decisão".

**Esforço estimado:** 3–4 dias de desenvolvimento.

**Entregáveis:**

1. Expandir `calcularPrecoProcedimento` com `margemLucro` e `precoMinimoParaMargem30`.
2. Coluna "Margem" na listagem de procedimentos por especialidade: badge verde (≥30%), amarelo (10–29%), vermelho (<10%).
3. Margem e preço mínimo no detalhe do procedimento.
4. Dashboard: substituir "5 procedimentos com menor margem vs. VRPO" por "procedimentos no vermelho" (baseado em margem real).
5. Alerta pós-save: ao salvar custos fixos ou preço de material, exibir toast "X procedimentos ficaram abaixo de 30% de margem" com link.

**Dependências:** Fase 1 (campos `percImpostos` e `percTaxaCartao` precisam existir).

**Critério de "feito":** Procedimento com preço R$ 280, custos R$ 243, impostos 8%, cartão 4% → margem exibida ≈ 8,4% (vermelho). Preço mínimo para 30% exibido = R$ 415.

---

## Fase 3 — Seed Completo e Fidedigno

**Objetivo:** Todo dentista que cria conta encontra seus procedimentos pré-configurados. Sem isso, o onboarding promete "10 minutos" mas entrega um sistema vazio.

**Esforço estimado:** 5–8 dias (dominado por curadoria de dados, não por código).

**Entregáveis:**

1. 200+ procedimentos VRPO reais em `vrpo-seed-data.ts`, com códigos, nomes, especialidades e tempos padrão da planilha original.
2. ~130 materiais com preços de referência do mercado nacional atual (distribuidores como Henry Schein, Dental Cremer).
3. ~50 procedimentos com composição completa de materiais pré-configurada (os mais frequentes de cada especialidade).
4. Valores VRPO oficiais (última publicação CNCC) substituindo as estimativas atuais.
5. Campo `custoLaboratorio` em `ProcedimentoMaterial` + procedimentos de prótese, faceta e ortodontia já com valor de referência.
6. Script de importação a partir de planilha para facilitar atualizações futuras sem editar TypeScript.

**Dependências:** Nenhuma de código (pode rodar em paralelo com Fase 1). Requer pesquisa e curadoria de dados antes do desenvolvimento.

**Critério de "feito":** Dentista generalista cria conta e encontra pelo menos 80% dos seus procedimentos do dia-a-dia pré-configurados, com margem calculada automaticamente sem entrada manual além dos custos fixos.

**Atenção pós-Fase 3:** Com 200+ procedimentos e 130+ materiais, as páginas de Materiais e Comparativo VRPO passam a carregar listas longas em uma única query sem limite. Antes de publicar o seed completo, adicionar paginação (scroll infinito ou paginação por página) nessas duas telas e remover o `findMany` sem `take` nos respectivos repositórios.

---

## Fase 4 — Onboarding Adaptativo e Dashboard de Diagnóstico

**Objetivo:** O primeiro login entrega valor em menos de 10 minutos. O dashboard responde "o que precisa de atenção agora?" sem que o dentista precise navegar.

**Esforço estimado:** 3–4 dias de desenvolvimento.

**Entregáveis:**

1. Wizard reformulado com pergunta inicial de perfil: "Atende sozinho(a) ou divide o espaço com outros dentistas?" — dois fluxos distintos.
2. Para perfil clínica: step explicativo sobre divisão de cadeiras com exemplo numérico antes do formulário.
3. Seção "Atenção necessária" no dashboard (aparece somente com alertas ativos): procedimentos no vermelho, custos desatualizados há mais de 6 meses, taxa de ociosidade não configurada.
4. Card "Faturamento mínimo semanal" (break-even ÷ 4) no dashboard.
5. Refatorar framing do comparativo VRPO: "margem para negociação" em vez de julgamento puro; texto explicativo sobre uso em credenciamento.

**Dependências:** Fases 1, 2 e 3.

**Critério de "feito":** Dentista solo cria conta, completa o wizard e vê a margem dos seus procedimentos em menos de 10 minutos — medido em teste com usuário real.

---

## Fase 5 — Simulador de Cenários e Exportação Profissional

**Objetivo:** Transformar o produto em ferramenta de decisão e de negociação — as features que justificam a assinatura para dentistas que já têm suas planilhas funcionando.

**Esforço estimado:** 4–6 dias de desenvolvimento.

**Entregáveis:**

1. Simulador de cenários: painel lateral em `/simulador` que permite ajustar variáveis de custo (custo fixo total, cadeiras, ociosidade, % impostos) sem salvar, exibindo impacto em tempo real no custo/min e na margem dos procedimentos. Inteiramente client-side.
2. PDF de credenciamento: novo template de exportação com memória de cálculo do custo fixo por minuto (cada item, depreciação, remuneração, retorno) e metodologia CNCC referenciada.
3. Narrativa no histórico: diff estruturado dos itens de custo que mudaram entre snapshots ("aluguel: R$ 2.500 → R$ 3.200").

**Dependências:** Fase 4.

**Critério de "feito":** Dentista ajusta aluguel no simulador e vê imediatamente quantos procedimentos cruzam para o vermelho, sem salvar. PDF de credenciamento aprovado em revisão por dentista que negocia com convênios.

---

## Pré-lançamento — Infraestrutura de Produção

**Objetivo:** Garantir que a infraestrutura está otimizada para usuários brasileiros antes do lançamento público.

**Entregáveis:**

1. Confirmar índices no banco para `procedimento.userId`, `material.userId` e `procedimento.especialidadeId` — são os filtros presentes em todas as queries principais e precisam de índice explícito no schema Prisma para não degradar com crescimento de dados.
2. Consolidar query redundante no dashboard: `getLastUpdateInfo` faz uma query separada em `custoFixoConfig` que poderia ser eliminada reutilizando o resultado já buscado em `getDashboardStats`.

**Dependências:** Feito antes do deploy de produção, após desenvolvimento estável.

---

## Fase 6 — Nice-to-Haves de Alto Valor

Sem data comprometida. Ordem de execução determinada pela demanda dos usuários.

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

| Fase | Foco | Esforço | Valor | Pode rodar com |
|---|---|---|---|---|
| 1 | Correções de cálculo | 1–2 dias | Crítico | Fase 3 (paralelo) |
| 2 | Margem visível + alertas | 3–4 dias | Alto | Após Fase 1 |
| 3 | Seed completo | 5–8 dias | Crítico | Fase 1 (paralelo) |
| 4 | Onboarding + dashboard | 3–4 dias | Alto | Após Fases 1+2+3 |
| 5 | Simulador + PDF profissional | 4–6 dias | Diferencial | Após Fase 4 |
| 6 | Nice-to-haves | Variável | Incremental | Qualquer ordem |

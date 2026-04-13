# Caso de Uso: Ortodontista Solo

> Perfil: Dr. Marcos, ortodontista, consultório individual em São Paulo.
> Objetivo: saber se os preços que cobra cobrem seus custos e geram margem real.

---

## Passo 1 — Criar a conta (5 minutos)

Dr. Marcos acessa o Precifica, cria conta com e-mail e senha.

Ao entrar no dashboard pela primeira vez, o wizard de onboarding é exibido automaticamente.

**Pergunta do wizard:** *"Como você atende?"*
→ Dr. Marcos seleciona **"Atendo sozinho(a) — consultório individual, 1 cadeira"**

O sistema salva o perfil `solo` e avança para os 3 passos de configuração.

---

## Passo 2 — Configurar os custos fixos (10–15 minutos)

O wizard direciona para `/custos-fixos`.

O sistema já carrega os **14 itens padrão da metodologia CNCC** preenchidos com valores de referência. Dr. Marcos precisa apenas **substituir pelos seus valores reais**:

| Item | Valor padrão | O que Dr. Marcos informa |
|---|---|---|
| Aluguel | R$ 2.000 | R$ 3.500 (consultório no Brooklin) |
| Energia elétrica | R$ 300 | R$ 420 |
| Contador | R$ 500 | R$ 650 |
| Salário (técnico/recepcionista) | R$ 1.800 | R$ 0 (atende sozinho) |
| ... | ... | ... |

Além dos itens, Dr. Marcos preenche:

- **Remuneração profissional:** R$ 12.000/mês (quanto quer se pagar)
- **Horas de trabalho:** 8h/dia, 20 dias úteis
- **Taxa de ociosidade:** 25% (consultório não está cheio)
- **Impostos (Simples Nacional):** 11,2%
- **Taxa de cartão:** 3,5%

> Ao salvar, o sistema calcula o **custo por minuto** automaticamente.
> Com esses dados, Dr. Marcos vai ver algo como: **R$ 3,20/min**.

---

## Passo 3 — Revisar os materiais de ortodontia (5–10 minutos)

O wizard direciona para `/materiais`.

O sistema já tem os materiais de ortodontia cadastrados com preços de referência:
- Braquete metálico (kit 20 peças) — R$ 88,00
- Fio ortodôntico NiTi — R$ 12,00
- Resina de colagem — R$ 45,00
- etc.

Dr. Marcos revisa os preços que realmente paga nos seus fornecedores e corrige os que estiverem desatualizados. Materiais de outras especialidades (periodontia, implante) podem ser ignorados — não afetarão os cálculos de ortodontia.

> **Dica de foco:** Os materiais de ortodontia ficam no final da lista. Use a busca ou role até encontrá-los.

---

## Passo 4 — Explorar os procedimentos de ortodontia (10 minutos)

O wizard direciona para `/procedimentos/diagnostico` (aba Diagnóstico por padrão).

**Dr. Marcos navega para a aba "Ortodontia"** na barra lateral de especialidades.

O sistema exibe os ~8 procedimentos pré-cadastrados para ortodontia:

| Procedimento | Tempo | Custo calculado | Preço mínimo (30% margem) |
|---|---|---|---|
| Instalação Aparelho Fixo Metálico | 90 min | R$ 288 + lab | — |
| Manutenção Mensal | 30 min | R$ 96 | — |
| Instalação Alinhador Transparente | 30 min | R$ 96 + lab | — |
| Contenção Colada (por arco) | 30 min | R$ 96 | — |
| ... | | | |

Os preços de venda ainda aparecem em branco — nenhum badge colorido ainda.

**Dr. Marcos abre o procedimento "Instalação Aparelho Fixo Metálico"** e informa o preço que cobra: **R$ 1.800**.

→ O sistema calcula a margem e exibe o badge:
- Verde se ≥ 30%
- Amarelo se 10–29%
- Vermelho se < 10%

Dr. Marcos faz isso para todos os procedimentos que efetivamente realiza (pode ignorar os que não usa).

---

## Passo 5 — Ler o dashboard com olhos treinados (5 minutos)

Com os procedimentos precificados, o dashboard `/dashboard` passa a ter informações acionáveis:

### Seção "Atenção necessária"
- **Procedimentos no vermelho:** lista os procedimentos abaixo de 30% de margem
- **Custos desatualizados:** alerta se os custos fixos não foram revisados há mais de 30 dias
- **Ociosidade não configurada:** lembra de ajustar se ainda estiver em 0%

### Card "Faturamento mínimo semanal"
Mostra o **break-even semanal** — o quanto Dr. Marcos precisa faturar por semana para cobrir todos os custos fixos, sem ainda ter lucro. Útil para planejar a agenda.

### Top 5 procedimentos por custo
Mostra quais procedimentos têm maior custo absoluto — útil para identificar onde revisar materiais ou renegociar fornecedores.

---

## Passo 6 — Usar o comparativo VRPO como argumento (situacional)

Quando um convênio ou paciente questiona o preço, Dr. Marcos acessa `/comparativo-vrpo`.

O sistema mostra lado a lado:
- **Seu preço de venda** (o que cobra)
- **Referência VRPO** (tabela nacional de referência da categoria)

Se o convênio propõe R$ 800 para a instalação do aparelho e a VRPO referencia R$ 1.200, Dr. Marcos tem dados concretos para a negociação — não está inventando um número.

> O Precifica enquadra o VRPO como **margem de negociação**, não como preço obrigatório.

---

## Passo 7 — Simular um cenário de ajuste (situacional)

Dr. Marcos está pensando em contratar uma recepcionista (+ R$ 1.800/mês) e quer saber o impacto antes de decidir.

Acessa `/simulador`, ajusta o custo fixo total para cima em R$ 1.800, e vê em tempo real:
- Novo custo por minuto
- Nova margem em cada procedimento de ortodontia
- Quais procedimentos passariam para o vermelho

Decide se o aumento de preços necessário é viável antes de contratar.

---

## Passo 8 — Tirar snapshot (recorrente, mensal)

Ao final de cada mês ou quando fizer ajuste de preços, Dr. Marcos acessa `/historico` e cria um snapshot.

Na próxima revisão, o sistema mostrará o **diff estruturado** — quais itens de custo fixo mudaram, qual era o custo/min antes e depois.

Util para justificar reajuste de preços para pacientes de longa data.

---

## Resumo do valor gerado

| Dúvida | Onde o Precifica responde |
|---|---|
| Meu preço de manutenção mensal cobre meus custos? | Procedimentos → badge de margem |
| Qual o mínimo que preciso faturar essa semana? | Dashboard → faturamento mínimo semanal |
| Se eu contratar alguém, quanto preciso reajustar? | Simulador |
| Esse convênio está pagando abaixo do mercado? | Comparativo VRPO |
| Meu custo/min aumentou nos últimos 3 meses? | Histórico → diff de snapshots |

---

## O que Dr. Marcos pode ignorar (por enquanto)

- Todas as outras especialidades na lista de procedimentos (periodontia, implante, endodontia) — estão lá mas não afetam os cálculos dele
- Exportação PDF/Excel — útil para credenciamento em convênios, mas não é prioridade inicial
- Materiais de outras especialidades — preço desatualizado de um material de cirurgia não impacta o custo de uma manutenção de aparelho

---

*Tempo total estimado para primeira configuração: 30–40 minutos.*
*Após configurado, a manutenção é de 5–10 minutos por mês.*

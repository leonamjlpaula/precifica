import type { CustoFixoConfig, CustoFixoItem } from '@prisma/client'

export type BreakEvenMensal = {
  /** Custos do consultório sem pró-labore (itens + depreciação + retorno) */
  semProLabore: number
  /** Custos totais com pró-labore — faturar acima disso é lucro acima do esperado */
  comProLabore: number
  /** Valor mensal do pró-labore (salário + encargos) */
  proLaboreMensal: number
}

export class CustoFixoPorMinuto {
  /**
   * Calculate the fixed cost per minute using the CNCC/VRPO methodology.
   *
   * Formula (verified against CNCC spreadsheet custos_consultorio.xlsx, rows 244–256):
   *   minutosUteis   = diasUteis * horasTrabalho * 60 * (1 - percOciosidade / 100)
   *   minutosAnuais  = minutosUteis * 11   (CNCC: 11 months/year, 1 month vacation)
   *   custoFixoBase  = totalItens / (minutosUteis * numeroCadeiras)
   *   depreciacao    = investimento / (anosDepreciacao * minutosAnuais)
   *   remuneracao    = salarioBase * (1 + fundoReserva% + insalubridade% + imprevistos%
   *                                     + 4/36          ← férias 1/12 + adicional 1/3
   *                                     + 1/12)         ← 13º salário
   *                    / minutosUteis
   *   taxaRetorno    = investimento / (anosRetorno * minutosAnuais)
   *                    ← NO percentage multiplier; CNCC recovers the full investment
   *                       over N years. taxaRetornoPerc is stored for display only.
   *
   *   result = custoFixoBase + depreciacao + remuneracao + taxaRetorno
   *
   * Validation: with CNCC reference data (investimento = 29969.28, custos = 13528.36,
   *   salario = 6000, 22 dias, 8h, 1 cadeira, 0% ociosidade) → R$ 2,475/min ✓
   *
   * Notes:
   *   - percImpostos and percTaxaCartao are NOT used here; they affect margin (Fase 2)
   */
  static calculate(config: CustoFixoConfig, items: CustoFixoItem[]): number {
    return this.calculateBreakdown(config, items).porMinuto
  }

  static calculateBreakdown(config: CustoFixoConfig, items: CustoFixoItem[]): BreakEvenMensal & { porMinuto: number } {
    const {
      diasUteis,
      horasTrabalho,
      investimentoEquipamentos,
      anosDepreciacao,
      salarioBase,
      percFundoReserva,
      percInsalubridade,
      percImprevistos,
      anosRetorno,
      numeroCadeiras,
      percOciosidade,
    } = config

    const minutosUteis = diasUteis * horasTrabalho * 60 * (1 - percOciosidade / 100)
    if (minutosUteis <= 0) {
      return { semProLabore: 0, comProLabore: 0, proLaboreMensal: 0, porMinuto: 0 }
    }

    const cadeiras = Math.max(1, numeroCadeiras)

    // 1. Fixed costs base (monthly items) — divided among active chairs
    const totalItens = items.reduce((sum, item) => sum + item.valor, 0)
    const custoFixoBase = totalItens / (minutosUteis * cadeiras)

    // 2. Equipment depreciation — CNCC uses 11 months/year (1 month vacation)
    const minutosAnuais = minutosUteis * 11
    const depreciacao = investimentoEquipamentos / (anosDepreciacao * minutosAnuais)

    // 3. Professional remuneration (salary + social charges)
    //    Mandatory CLT charges added per CNCC spreadsheet (rows 248–252):
    //      - férias: 1/12 + adicional 1/3 = 4/36 ≈ 11.11%
    //      - 13º salário: 1/12 ≈ 8.33%
    const proLaboreMensal =
      salarioBase *
      (1 +
        percFundoReserva / 100 +
        percInsalubridade / 100 +
        percImprevistos / 100 +
        4 / 36 + // férias (1/12) + adicional de férias (1/3 de 1/12)
        1 / 12) // 13º salário
    const remuneracao = proLaboreMensal / minutosUteis

    // 4. Return on investment — CNCC uses 11 months/year.
    //    The formula divides the full investment by the number of years (no % multiplier).
    //    "Taxa de retorno de 3% em 3 anos" = recover investment in 3 years; taxaRetornoPerc
    //    is NOT applied here — verified in planilha CNCC row 255: 29969.28 ÷ 3 ÷ 11 ÷ … = 0.086.
    const taxaRetorno = investimentoEquipamentos / (anosRetorno * minutosAnuais)

    const porMinutoSemProLabore = custoFixoBase + depreciacao + taxaRetorno
    const porMinuto = porMinutoSemProLabore + remuneracao

    return {
      semProLabore: porMinutoSemProLabore * minutosUteis,
      comProLabore: porMinuto * minutosUteis,
      proLaboreMensal,
      porMinuto,
    }
  }
}

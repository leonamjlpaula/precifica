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
   * Calculate the fixed cost per minute using the VRPO methodology.
   *
   * Formula:
   *   custoFixoBase  = totalItens / (diasUteis * horasTrabalho * 60)
   *   depreciacao    = investimento / (anosDepreciacao * 12 * diasUteis * horasTrabalho * 60)
   *   remuneracao    = salarioBase * (1 + fundoReserva% + insalubridade% + imprevistos%)
   *                    / (diasUteis * horasTrabalho * 60)
   *   taxaRetorno    = investimento * taxaRetorno%
   *                    / (anosRetorno * 12 * diasUteis * horasTrabalho * 60)
   *
   *   result = custoFixoBase + depreciacao + remuneracao + taxaRetorno
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
      taxaRetornoPerc,
      anosRetorno,
    } = config

    const minutosUteis = diasUteis * horasTrabalho * 60
    if (minutosUteis <= 0) {
      return { semProLabore: 0, comProLabore: 0, proLaboreMensal: 0, porMinuto: 0 }
    }

    // 1. Fixed costs base (monthly items)
    const totalItens = items.reduce((sum, item) => sum + item.valor, 0)
    const custoFixoBase = totalItens / minutosUteis

    // 2. Equipment depreciation (spread over useful life in months)
    const minutosAnuais = minutosUteis * 12
    const depreciacao = investimentoEquipamentos / (anosDepreciacao * minutosAnuais)

    // 3. Professional remuneration (salary + social charges)
    const proLaboreMensal =
      salarioBase * (1 + percFundoReserva / 100 + percInsalubridade / 100 + percImprevistos / 100)
    const remuneracao = proLaboreMensal / minutosUteis

    // 4. Return on investment
    const taxaRetorno =
      (investimentoEquipamentos * (taxaRetornoPerc / 100)) / (anosRetorno * minutosAnuais)

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

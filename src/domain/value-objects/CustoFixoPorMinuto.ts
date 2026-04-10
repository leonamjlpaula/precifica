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
   * Formula:
   *   minutosUteis   = diasUteis * horasTrabalho * 60 * (1 - percOciosidade / 100)
   *   custoFixoBase  = totalItens / (minutosUteis * numeroCadeiras)
   *   depreciacao    = investimento / (anosDepreciacao * 11 * minutosUteis)
   *   remuneracao    = salarioBase * (1 + fundoReserva% + insalubridade% + imprevistos%)
   *                    / minutosUteis
   *   taxaRetorno    = investimento * taxaRetorno%
   *                    / (anosRetorno * 11 * minutosUteis)
   *
   *   result = custoFixoBase + depreciacao + remuneracao + taxaRetorno
   *
   * Notes:
   *   - 11 months/year per CNCC (1 month vacation excluded from depreciation/return)
   *   - numeroCadeiras divides fixed costs among active chairs in the clinic
   *   - percOciosidade reduces effective working minutes (e.g. 20% = 80% occupancy)
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
      taxaRetornoPerc,
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
    const proLaboreMensal =
      salarioBase * (1 + percFundoReserva / 100 + percInsalubridade / 100 + percImprevistos / 100)
    const remuneracao = proLaboreMensal / minutosUteis

    // 4. Return on investment — CNCC uses 11 months/year
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

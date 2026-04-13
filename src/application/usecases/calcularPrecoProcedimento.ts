import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

export type PrecoCalculado = {
  custoVariavel: number
  custoFixoTotal: number
  /** Break-even price: custoFixoTotal + custoVariavel */
  precoFinal: number
  /**
   * Selling price set by the dentist.
   * null when not configured — margin cannot be determined.
   */
  precoVenda: number | null
  /**
   * Profit margin after taxes and card fees.
   * Formula: (precoVenda − precoFinal − precoVenda × (percImpostos + percTaxaCartao) / 100) / precoVenda
   * null when precoVenda is not set.
   */
  margemLucro: number | null
  /**
   * Minimum selling price to achieve 30% profit margin.
   * Formula: precoFinal / (1 − (percImpostos + percTaxaCartao) / 100 − 0.30)
   */
  precoMinimoParaMargem30: number
}

/**
 * Parse numeric value from consumo string.
 * Examples: "1 par" → 1, "2 tubetes" → 2, "0,5ml" → 0.5, "cobertura" → 1
 */
export function parseConsumoNumerico(consumo: string): number {
  // Replace Brazilian decimal comma with period
  const normalized = consumo.replace(',', '.')
  const match = normalized.match(/^(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 1
}

/**
 * Determine the margin badge color based on margemLucro.
 * Returns null when margin is not calculable (no precoVenda set).
 */
export function margemColor(margemLucro: number | null): 'green' | 'yellow' | 'red' | null {
  if (margemLucro === null) return null
  const pct = margemLucro * 100
  if (pct >= 30) return 'green'
  if (pct >= 10) return 'yellow'
  return 'red'
}

/**
 * Calculate procedure price using VRPO methodology plus Fase 2 margin fields:
 *
 * - custoVariavel: Σ (material.preco / pma.divisor) × consumoNumerico
 * - custoFixoTotal: procedimento.tempoMinutos × custoFixoPorMinuto
 * - precoFinal (break-even): custoFixoTotal + custoVariavel
 * - margemLucro: (precoVenda − precoFinal − precoVenda × (percImpostos + percTaxaCartao) / 100) / precoVenda
 * - precoMinimoParaMargem30: precoFinal / (1 − (percImpostos + percTaxaCartao) / 100 − 0.30)
 */
export function calcularPrecoProcedimento(
  procedimento: ProcedimentoWithMateriais,
  custoFixoPorMinuto: number,
  percImpostos: number = 8,
  percTaxaCartao: number = 4,
): PrecoCalculado {
  const custoVariavel = procedimento.materiais.reduce((sum, pma) => {
    const consumoNumerico = parseConsumoNumerico(pma.consumo)
    const custoPorUnidade = pma.material.preco / pma.divisor
    return sum + custoPorUnidade * consumoNumerico
  }, 0)

  const custoFixoTotal = procedimento.tempoMinutos * custoFixoPorMinuto
  const precoFinal = custoFixoTotal + custoVariavel

  const percTotal = percImpostos + percTaxaCartao

  // precoMinimoParaMargem30: minimum selling price for 30% margin
  // Derived from: margem = (pv - pe - pv * percTotal/100) / pv = 0.30
  // → pv * (1 - percTotal/100 - 0.30) = pe → pv = pe / (1 - percTotal/100 - 0.30)
  const denominador = 1 - percTotal / 100 - 0.30
  const precoMinimoParaMargem30 = denominador > 0 ? precoFinal / denominador : Infinity

  const precoVenda = procedimento.precoVenda ?? null

  let margemLucro: number | null = null
  if (precoVenda !== null && precoVenda > 0) {
    margemLucro = (precoVenda - precoFinal - precoVenda * percTotal / 100) / precoVenda
  }

  return { custoVariavel, custoFixoTotal, precoFinal, precoVenda, margemLucro, precoMinimoParaMargem30 }
}

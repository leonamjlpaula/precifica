import type { CustoFixoConfig, CustoFixoItem } from '@prisma/client'

export type CustoFixoWithItems = CustoFixoConfig & { items: CustoFixoItem[] }

export type UpsertCustoFixoData = {
  diasUteis?: number
  horasTrabalho?: number
  investimentoEquipamentos?: number
  anosDepreciacao?: number
  salarioBase?: number
  percFundoReserva?: number
  percInsalubridade?: number
  percImprevistos?: number
  taxaRetornoPerc?: number
  anosRetorno?: number
  numeroCadeiras?: number
  percOciosidade?: number
  percImpostos?: number
  percTaxaCartao?: number
  items?: Array<{
    id?: string
    nome: string
    valor: number
    ordem: number
    isCustom: boolean
  }>
}

export interface ICustoFixoRepository {
  getByUserId(userId: string): Promise<CustoFixoWithItems | null>
  upsert(userId: string, data: UpsertCustoFixoData): Promise<CustoFixoWithItems>
}

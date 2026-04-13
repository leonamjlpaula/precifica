'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto'
import { PrismaCustoFixoRepository } from '@/infrastructure/repositories/PrismaCustoFixoRepository'
import { contarProcedimentosNoVermelho } from './dashboardActions'
import type { CustoFixoConfig, CustoFixoItem } from '@prisma/client'

export type CustoFixoConfigResult = {
  config: CustoFixoConfig
  items: CustoFixoItem[]
  custoFixoPorMinuto: number
}

const repository = new PrismaCustoFixoRepository()

// ─── getCustoFixoConfig ────────────────────────────────────────────────────────

export async function getCustoFixoConfig(userId: string): Promise<CustoFixoConfigResult | null> {
  const data = await repository.getByUserId(userId)
  if (!data) return null

  const { items, ...config } = data
  const custoFixoPorMinuto = CustoFixoPorMinuto.calculate(config, items)

  return { config, items, custoFixoPorMinuto }
}

// ─── saveCustoFixoConfig ───────────────────────────────────────────────────────

const saveConfigSchema = z.object({
  diasUteis: z.number().int().min(1).max(31),
  horasTrabalho: z.number().int().min(1).max(24),
  investimentoEquipamentos: z.number().min(0),
  anosDepreciacao: z.number().int().min(1),
  salarioBase: z.number().min(0),
  percFundoReserva: z.number().min(0).max(100),
  percInsalubridade: z.number().min(0).max(100),
  percImprevistos: z.number().min(0).max(100),
  taxaRetornoPerc: z.number().min(0).max(100),
  anosRetorno: z.number().int().min(1),
  numeroCadeiras: z.number().int().min(1).max(20),
  percOciosidade: z.number().min(0).max(100),
  percImpostos: z.number().min(0).max(100),
  percTaxaCartao: z.number().min(0).max(100),
  items: z.array(
    z.object({
      id: z.string().optional(),
      nome: z.string().min(1),
      valor: z.number().min(0),
      ordem: z.number().int().min(0),
      isCustom: z.boolean(),
    })
  ),
})

export type SaveCustoFixoConfigData = z.infer<typeof saveConfigSchema>

export type SaveCustoFixoConfigState = {
  errors?: { general?: string[] }
  success?: boolean
  /** Number of procedures now below 10% margin after the save */
  procedimentosNoVermelho?: number
}

export async function saveCustoFixoConfig(
  userId: string,
  data: SaveCustoFixoConfigData
): Promise<SaveCustoFixoConfigState> {
  const result = saveConfigSchema.safeParse(data)
  if (!result.success) {
    return { errors: { general: result.error.errors.map((e) => e.message) } }
  }

  try {
    await repository.upsert(userId, result.data)
    const procedimentosNoVermelho = await contarProcedimentosNoVermelho(userId)
    return { success: true, procedimentosNoVermelho }
  } catch {
    return { errors: { general: ['Erro ao salvar configuração. Tente novamente.'] } }
  }
}

// ─── addCustoFixoItem ──────────────────────────────────────────────────────────

export type AddCustoFixoItemState = {
  errors?: { general?: string[] }
  success?: boolean
}

export async function addCustoFixoItem(
  userId: string,
  nome: string,
  valor: number
): Promise<AddCustoFixoItemState> {
  if (!nome || nome.trim().length === 0) {
    return { errors: { general: ['Nome do item é obrigatório'] } }
  }
  if (valor < 0) {
    return { errors: { general: ['Valor não pode ser negativo'] } }
  }

  try {
    const config = await prisma.custoFixoConfig.findUnique({ where: { userId } })
    if (!config) {
      return { errors: { general: ['Configuração não encontrada'] } }
    }

    // Determine order (after last item)
    const lastItem = await prisma.custoFixoItem.findFirst({
      where: { configId: config.id },
      orderBy: { ordem: 'desc' },
    })
    const nextOrdem = (lastItem?.ordem ?? 0) + 1

    await prisma.custoFixoItem.create({
      data: {
        configId: config.id,
        nome: nome.trim(),
        valor,
        ordem: nextOrdem,
        isCustom: true,
      },
    })

    return { success: true }
  } catch {
    return { errors: { general: ['Erro ao adicionar item. Tente novamente.'] } }
  }
}

// ─── deleteCustoFixoItem ───────────────────────────────────────────────────────

export type DeleteCustoFixoItemState = {
  errors?: { general?: string[] }
  success?: boolean
}

export async function deleteCustoFixoItem(
  itemId: string,
  userId: string
): Promise<DeleteCustoFixoItemState> {
  try {
    // Verify the item belongs to the user's config and is custom
    const config = await prisma.custoFixoConfig.findUnique({ where: { userId } })
    if (!config) {
      return { errors: { general: ['Configuração não encontrada'] } }
    }

    const item = await prisma.custoFixoItem.findFirst({
      where: { id: itemId, configId: config.id },
    })

    if (!item) {
      return { errors: { general: ['Item não encontrado'] } }
    }

    if (!item.isCustom) {
      return { errors: { general: ['Apenas itens customizados podem ser excluídos'] } }
    }

    await prisma.custoFixoItem.delete({ where: { id: itemId } })

    return { success: true }
  } catch {
    return { errors: { general: ['Erro ao excluir item. Tente novamente.'] } }
  }
}

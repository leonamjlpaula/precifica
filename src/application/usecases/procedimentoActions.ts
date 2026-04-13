'use server'

import { prisma } from '@/lib/db'
import { PrismaProcedimentoRepository } from '@/infrastructure/repositories/PrismaProcedimentoRepository'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'
import type { PrecoCalculado } from './calcularPrecoProcedimento'

export type ActionResult = { success: boolean; error?: string }

const repository = new PrismaProcedimentoRepository()

export type ProcedimentoComPreco = {
  procedimento: ProcedimentoWithMateriais
  precoCalculado: PrecoCalculado
  vrpoReferencia: number | null
}

export type CreateProcedimentoResult = {
  success: boolean
  procedimento?: ProcedimentoWithMateriais
  errors?: Record<string, string[]>
}

// ─── getProcedimentosByEspecialidade ──────────────────────────────────────────

export async function getProcedimentosByEspecialidade(
  userId: string,
  especialidadeSlug: string
): Promise<ProcedimentoComPreco[]> {
  const especialidade = await prisma.especialidade.findUnique({
    where: { codigo: especialidadeSlug },
  })
  if (!especialidade) return []

  const procedimentos = await repository.listByUserAndEspecialidade(userId, especialidade.id)
  const custoFixoPorMinuto = await calcularCustoFixoPorMinuto(userId)

  // Fetch VRPO references for all procedure codes in a single query
  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({
    where: { codigo: { in: codigos } },
  })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  return procedimentos.map((procedimento) => ({
    procedimento,
    precoCalculado: calcularPrecoProcedimento(procedimento, custoFixoPorMinuto),
    vrpoReferencia: vrpoMap.get(procedimento.codigo) ?? null,
  }))
}

// ─── searchProcedimentos ───────────────────────────────────────────────────────

export async function searchProcedimentos(
  userId: string,
  query: string
): Promise<ProcedimentoComPreco[]> {
  if (!query.trim()) return []

  const procedimentos = (await prisma.procedimento.findMany({
    where: {
      userId,
      OR: [
        { nome: { contains: query, mode: 'insensitive' } },
        { codigo: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      especialidade: true,
      materiais: {
        include: { material: true },
        orderBy: { ordem: 'asc' },
      },
    },
    orderBy: { codigo: 'asc' },
    take: 50,
  })) as ProcedimentoWithMateriais[]

  const custoFixoPorMinuto = await calcularCustoFixoPorMinuto(userId)

  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({
    where: { codigo: { in: codigos } },
  })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  return procedimentos.map((procedimento) => ({
    procedimento,
    precoCalculado: calcularPrecoProcedimento(procedimento, custoFixoPorMinuto),
    vrpoReferencia: vrpoMap.get(procedimento.codigo) ?? null,
  }))
}

// ─── createProcedimentoCustomizado ────────────────────────────────────────────

export async function createProcedimentoCustomizado(
  userId: string,
  especialidadeId: string,
  codigo: string,
  nome: string,
  tempoMinutos: number
): Promise<CreateProcedimentoResult> {
  if (!codigo.trim()) return { success: false, errors: { codigo: ['Código é obrigatório'] } }
  if (!nome.trim()) return { success: false, errors: { nome: ['Nome é obrigatório'] } }
  if (tempoMinutos <= 0)
    return { success: false, errors: { tempo: ['Tempo deve ser maior que zero'] } }

  try {
    const procedimento = (await prisma.procedimento.create({
      data: {
        userId,
        especialidadeId,
        codigo: codigo.trim(),
        nome: nome.trim(),
        tempoMinutos,
        isCustom: true,
      },
      include: {
        especialidade: true,
        materiais: {
          include: { material: true },
          orderBy: { ordem: 'asc' },
        },
      },
    })) as ProcedimentoWithMateriais

    return { success: true, procedimento }
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code: string }).code === 'P2002'
    ) {
      return { success: false, errors: { codigo: ['Código já existe para este usuário'] } }
    }
    return {
      success: false,
      errors: { general: ['Erro ao criar procedimento. Tente novamente.'] },
    }
  }
}

// ─── getProcedimentoDetail ────────────────────────────────────────────────────

export async function getProcedimentoDetail(
  id: string,
  userId: string
): Promise<ProcedimentoComPreco | null> {
  const procedimento = await repository.getDetail(id, userId)
  if (!procedimento) return null

  const custoFixoPorMinuto = await calcularCustoFixoPorMinuto(userId)
  const vrpoRef = await prisma.vRPOReferencia.findUnique({
    where: { codigo: procedimento.codigo },
  })

  return {
    procedimento,
    precoCalculado: calcularPrecoProcedimento(procedimento, custoFixoPorMinuto),
    vrpoReferencia: vrpoRef?.valorReferencia ?? null,
  }
}

// ─── updateProcedimentoTempo ──────────────────────────────────────────────────

export async function updateProcedimentoTempo(
  id: string,
  userId: string,
  tempoMinutos: number
): Promise<ActionResult> {
  if (tempoMinutos <= 0) return { success: false, error: 'Tempo deve ser maior que zero' }

  const procedimento = await prisma.procedimento.findFirst({ where: { id, userId } })
  if (!procedimento) return { success: false, error: 'Procedimento não encontrado' }

  await prisma.procedimento.update({
    where: { id },
    data: { tempoMinutos },
  })
  return { success: true }
}

// ─── addMaterialToProcedimento ────────────────────────────────────────────────

export async function addMaterialToProcedimento(
  procedimentoId: string,
  userId: string,
  materialId: string,
  consumo: string,
  divisor: number
): Promise<ActionResult> {
  if (!consumo.trim()) return { success: false, error: 'Consumo é obrigatório' }
  if (divisor <= 0) return { success: false, error: 'Divisor deve ser maior que zero' }

  const procedimento = await prisma.procedimento.findFirst({ where: { id: procedimentoId, userId } })
  if (!procedimento) return { success: false, error: 'Procedimento não encontrado' }

  const material = await prisma.material.findFirst({ where: { id: materialId, userId } })
  if (!material) return { success: false, error: 'Material não encontrado' }

  const count = await prisma.procedimentoMaterial.count({ where: { procedimentoId } })

  await prisma.procedimentoMaterial.create({
    data: {
      procedimentoId,
      materialId,
      consumo: consumo.trim(),
      divisor,
      ordem: count + 1,
    },
  })
  return { success: true }
}

// ─── removeMaterialFromProcedimento ──────────────────────────────────────────

export async function removeMaterialFromProcedimento(
  pmaId: string,
  userId: string
): Promise<ActionResult> {
  const pma = await prisma.procedimentoMaterial.findFirst({
    where: { id: pmaId },
    include: { procedimento: true },
  })
  if (!pma || pma.procedimento.userId !== userId) {
    return { success: false, error: 'Item não encontrado' }
  }

  await prisma.procedimentoMaterial.delete({ where: { id: pmaId } })
  return { success: true }
}

// ─── updateProcedimentoMaterial ───────────────────────────────────────────────

export async function updateProcedimentoMaterial(
  pmaId: string,
  userId: string,
  consumo: string,
  divisor: number
): Promise<ActionResult> {
  if (!consumo.trim()) return { success: false, error: 'Consumo é obrigatório' }
  if (divisor <= 0) return { success: false, error: 'Divisor deve ser maior que zero' }

  const pma = await prisma.procedimentoMaterial.findFirst({
    where: { id: pmaId },
    include: { procedimento: true },
  })
  if (!pma || pma.procedimento.userId !== userId) {
    return { success: false, error: 'Item não encontrado' }
  }

  await prisma.procedimentoMaterial.update({
    where: { id: pmaId },
    data: { consumo: consumo.trim(), divisor },
  })
  return { success: true }
}

// ─── deleteProcedimento ───────────────────────────────────────────────────────

export async function deleteProcedimento(
  id: string,
  userId: string
): Promise<ActionResult> {
  const procedimento = await prisma.procedimento.findFirst({ where: { id, userId } })
  if (!procedimento) return { success: false, error: 'Procedimento não encontrado' }
  if (!procedimento.isCustom) {
    return { success: false, error: 'Apenas procedimentos customizados podem ser excluídos' }
  }

  await prisma.procedimento.delete({ where: { id } })
  return { success: true }
}

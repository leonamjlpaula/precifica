'use server'

import { prisma } from '@/lib/db'
import { PrismaProcedimentoRepository } from '@/infrastructure/repositories/PrismaProcedimentoRepository'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'
import type { PrecoCalculado } from './calcularPrecoProcedimento'

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

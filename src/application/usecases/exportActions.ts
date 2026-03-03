'use server'

import { prisma } from '@/lib/db'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ExportPreviewItem = {
  id: string
  codigo: string
  nome: string
  especialidadeNome: string
  especialidadeSlug: string
  isCustom: boolean
  tempoMinutos: number
  custoVariavel: number
  precoFinal: number
  vrpoReferencia: number | null
}

export type ExportData = {
  items: ExportPreviewItem[]
  especialidades: { id: string; nome: string; codigo: string }[]
}

// ─── getExportData ─────────────────────────────────────────────────────────────

export async function getExportData(userId: string): Promise<ExportData> {
  const [procedimentosRaw, custoFixoPorMinuto, especialidades] = await Promise.all([
    prisma.procedimento.findMany({
      where: { userId },
      include: {
        especialidade: true,
        materiais: { include: { material: true }, orderBy: { ordem: 'asc' } },
      },
      orderBy: { codigo: 'asc' },
    }),
    calcularCustoFixoPorMinuto(userId),
    prisma.especialidade.findMany({ orderBy: { faixaInicio: 'asc' } }),
  ])

  const procedimentos = procedimentosRaw as ProcedimentoWithMateriais[]

  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({
    where: { codigo: { in: codigos } },
  })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  const items: ExportPreviewItem[] = procedimentos.map((p) => {
    const { custoVariavel, precoFinal } = calcularPrecoProcedimento(p, custoFixoPorMinuto)
    return {
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      especialidadeNome: p.especialidade.nome,
      especialidadeSlug: p.especialidade.codigo,
      isCustom: p.isCustom,
      tempoMinutos: p.tempoMinutos,
      custoVariavel,
      precoFinal,
      vrpoReferencia: vrpoMap.get(p.codigo) ?? null,
    }
  })

  return {
    items,
    especialidades: especialidades.map((e) => ({ id: e.id, nome: e.nome, codigo: e.codigo })),
  }
}

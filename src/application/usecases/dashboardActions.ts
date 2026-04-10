'use server'

import { prisma } from '@/lib/db'
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DashboardStats = {
  custoFixoPorMinuto: number
  totalCustosFixosMensais: number
  totalProcedimentos: number
  totalMateriais: number
  breakEven: {
    semProLabore: number
    comProLabore: number
    proLaboreMensal: number
  }
  ociosidadeNaoConfigurada: boolean
}

export type TopProcedimento = {
  id: string
  codigo: string
  nome: string
  especialidadeNome: string
  especialidadeSlug: string
  precoFinal: number
  tempoMinutos: number
}

export type BottomVRPOProcedimento = {
  id: string
  codigo: string
  nome: string
  especialidadeNome: string
  especialidadeSlug: string
  precoFinal: number
  vrpoReferencia: number
  diferencaPerc: number
}

// ─── Helper ────────────────────────────────────────────────────────────────────

async function getAllProcedimentos(userId: string): Promise<ProcedimentoWithMateriais[]> {
  return prisma.procedimento.findMany({
    where: { userId },
    include: {
      especialidade: true,
      materiais: {
        include: { material: true },
        orderBy: { ordem: 'asc' },
      },
    },
  }) as Promise<ProcedimentoWithMateriais[]>
}

// ─── getDashboardStats ─────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [config, totalProcedimentos, totalMateriais] = await Promise.all([
    prisma.custoFixoConfig.findUnique({
      where: { userId },
      include: { items: true },
    }),
    prisma.procedimento.count({ where: { userId } }),
    prisma.material.count({ where: { userId } }),
  ])

  let custoFixoPorMinuto = 0
  let totalCustosFixosMensais = 0
  let breakEven = { semProLabore: 0, comProLabore: 0, proLaboreMensal: 0 }

  if (config) {
    const breakdown = CustoFixoPorMinuto.calculateBreakdown(config, config.items)
    custoFixoPorMinuto = breakdown.porMinuto
    totalCustosFixosMensais = breakdown.comProLabore
    breakEven = {
      semProLabore: breakdown.semProLabore,
      comProLabore: breakdown.comProLabore,
      proLaboreMensal: breakdown.proLaboreMensal,
    }
  }

  return {
    custoFixoPorMinuto,
    totalCustosFixosMensais,
    totalProcedimentos,
    totalMateriais,
    breakEven,
    ociosidadeNaoConfigurada: config?.percOciosidade === 0,
  }
}

// ─── getTopProcedimentos ───────────────────────────────────────────────────────

export async function getTopProcedimentos(
  userId: string,
  limit: number = 5,
  order: 'highest' | 'lowest' = 'highest'
): Promise<TopProcedimento[]> {
  const [procedimentos, custoFixoPorMinuto] = await Promise.all([
    getAllProcedimentos(userId),
    calcularCustoFixoPorMinuto(userId),
  ])

  const comPreco = procedimentos.map((p) => ({
    ...p,
    precoFinal: calcularPrecoProcedimento(p, custoFixoPorMinuto).precoFinal,
  }))

  comPreco.sort((a, b) =>
    order === 'highest' ? b.precoFinal - a.precoFinal : a.precoFinal - b.precoFinal
  )

  return comPreco.slice(0, limit).map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    especialidadeNome: p.especialidade.nome,
    especialidadeSlug: p.especialidade.codigo,
    precoFinal: p.precoFinal,
    tempoMinutos: p.tempoMinutos,
  }))
}

// ─── getBottomProcedimentosVRPO ────────────────────────────────────────────────

export async function getBottomProcedimentosVRPO(
  userId: string,
  limit: number = 5
): Promise<BottomVRPOProcedimento[]> {
  const [procedimentos, custoFixoPorMinuto] = await Promise.all([
    getAllProcedimentos(userId),
    calcularCustoFixoPorMinuto(userId),
  ])

  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({
    where: { codigo: { in: codigos } },
  })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  const comDiferenca = procedimentos
    .map((p) => {
      const vrpo = vrpoMap.get(p.codigo) ?? null
      if (vrpo === null) return null
      const { precoFinal } = calcularPrecoProcedimento(p, custoFixoPorMinuto)
      const diferencaPerc = ((precoFinal - vrpo) / vrpo) * 100
      return {
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        especialidadeNome: p.especialidade.nome,
        especialidadeSlug: p.especialidade.codigo,
        precoFinal,
        vrpoReferencia: vrpo,
        diferencaPerc,
      }
    })
    .filter((p): p is BottomVRPOProcedimento => p !== null)

  // Sort by most negative difference first (most below VRPO)
  comDiferenca.sort((a, b) => a.diferencaPerc - b.diferencaPerc)

  return comDiferenca.slice(0, limit)
}

// ─── getLastUpdateInfo ─────────────────────────────────────────────────────────

export async function getLastUpdateInfo(userId: string): Promise<Date | null> {
  const config = await prisma.custoFixoConfig.findUnique({
    where: { userId },
    select: { updatedAt: true },
  })
  return config?.updatedAt ?? null
}

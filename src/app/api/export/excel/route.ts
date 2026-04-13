import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { calcularCustoFixoPorMinuto } from '@/application/usecases/calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from '@/application/usecases/calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'
import {
  ExcelExportService,
  type ProcedimentoExportExcel,
} from '@/infrastructure/services/ExcelExportService'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = request.nextUrl
  const especialidade = searchParams.get('especialidade') ?? 'all'
  const tipo = searchParams.get('tipo') ?? 'all'

  const userId = user.id
  const userName = user.user_metadata?.nome ?? user.email ?? 'Usuário'

  // Build dynamic where clause
  const where: { userId: string; especialidadeId?: string; isCustom?: boolean } = { userId }

  if (especialidade !== 'all') {
    const esp = await prisma.especialidade.findUnique({ where: { codigo: especialidade } })
    if (esp) {
      where.especialidadeId = esp.id
    }
  }

  if (tipo === 'custom') {
    where.isCustom = true
  } else if (tipo === 'standard') {
    where.isCustom = false
  }

  // Fetch procedures and custo fixo por minuto in parallel
  const [procedimentosRaw, custoFixoPorMinuto] = await Promise.all([
    prisma.procedimento.findMany({
      where,
      include: {
        especialidade: true,
        materiais: { include: { material: true }, orderBy: { ordem: 'asc' } },
      },
      orderBy: { codigo: 'asc' },
    }),
    calcularCustoFixoPorMinuto(userId),
  ])

  const procedimentos = procedimentosRaw as ProcedimentoWithMateriais[]

  // Batch fetch VRPO references
  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({ where: { codigo: { in: codigos } } })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  // Build export data with calculated prices
  const procedimentosExport: ProcedimentoExportExcel[] = procedimentos.map((p) => {
    const preco = calcularPrecoProcedimento(p, custoFixoPorMinuto)
    return {
      codigo: p.codigo,
      nome: p.nome,
      especialidade: p.especialidade.nome,
      tempoMinutos: p.tempoMinutos,
      custoVariavel: preco.custoVariavel,
      precoFinal: preco.precoFinal,
      vrpoReferencia: vrpoMap.get(p.codigo) ?? null,
    }
  })

  // Generate Excel
  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const service = new ExcelExportService()
  const excelBuffer = service.generate(procedimentosExport, userName, generatedAt)

  // Build filename: precifica-[nome-slug]-[YYYY-MM-DD].xlsx
  const dateStr = new Date().toISOString().split('T')[0]
  const nameSlug = userName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const filename = `precifica-${nameSlug}-${dateStr}.xlsx`

  return new Response(new Uint8Array(excelBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  getProcedimentosByEspecialidade,
  searchProcedimentos,
} from '@/application/usecases/procedimentoActions'
import { ProcedimentosPage } from '@/presentation/components/procedimentos/ProcedimentosPage'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ especialidade: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  
  const { especialidade: especialidadeSlug } = await params
  const { q: searchQuery } = await searchParams

  const especialidades = await prisma.especialidade.findMany({
    orderBy: { faixaInicio: 'asc' },
  })

  const currentEspecialidade = especialidades.find((e) => e.codigo === especialidadeSlug)
  if (!currentEspecialidade) redirect('/procedimentos/diagnostico')

  const counts = await prisma.procedimento.groupBy({
    by: ['especialidadeId'],
    where: { userId },
    _count: { id: true },
  })
  const countMap = new Map(counts.map((c) => [c.especialidadeId, c._count.id]))

  const especialidadesWithCount = especialidades.map((e) => ({
    ...e,
    count: countMap.get(e.id) ?? 0,
  }))

  const procedimentos = searchQuery
    ? await searchProcedimentos(userId, searchQuery)
    : await getProcedimentosByEspecialidade(userId, especialidadeSlug)

  return (
    <ProcedimentosPage
      userId={userId}
      especialidades={especialidadesWithCount}
      currentEspecialidade={currentEspecialidade}
      initialProcedimentos={procedimentos}
      initialSearchQuery={searchQuery ?? ''}
    />
  )
}

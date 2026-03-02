import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
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
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const { especialidade: especialidadeSlug } = await params
  const { q: searchQuery } = await searchParams

  // Fetch all especialidades for sidebar navigation
  const especialidades = await prisma.especialidade.findMany({
    orderBy: { faixaInicio: 'asc' },
  })

  const currentEspecialidade = especialidades.find((e) => e.codigo === especialidadeSlug)
  if (!currentEspecialidade) redirect('/procedimentos/diagnostico')

  // Get procedure counts per especialidade for sidebar badges
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

  // Fetch procedures: search across all specialties or list by current specialty
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

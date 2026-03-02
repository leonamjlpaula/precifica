import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getProcedimentoDetail } from '@/application/usecases/procedimentoActions'
import { getMateriais } from '@/application/usecases/materialActions'
import { ProcedimentoDetailPage } from '@/presentation/components/procedimentos/ProcedimentoDetailPage'

export default async function Page({
  params,
}: {
  params: Promise<{ especialidade: string; id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const { especialidade: especialidadeSlug, id } = await params

  const detail = await getProcedimentoDetail(id, userId)
  if (!detail) redirect(`/procedimentos/${especialidadeSlug}`)

  const materiais = await getMateriais(userId)

  return (
    <ProcedimentoDetailPage
      userId={userId}
      especialidadeSlug={especialidadeSlug}
      detail={detail}
      materiais={materiais}
    />
  )
}

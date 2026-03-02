import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMateriais } from '@/application/usecases/materialActions'
import { MateriaisTable } from '@/presentation/components/materiais/MateriaisTable'

export default async function MateriaisPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const materiais = await getMateriais(userId)

  return <MateriaisTable userId={userId} initialMateriais={materiais} />
}

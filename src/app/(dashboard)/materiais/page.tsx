import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { getMateriais } from '@/application/usecases/materialActions'
import { MateriaisTable } from '@/presentation/components/materiais/MateriaisTable'

export default async function MateriaisPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  
  const materiais = await getMateriais(userId)

  return <MateriaisTable userId={userId} initialMateriais={materiais} />
}

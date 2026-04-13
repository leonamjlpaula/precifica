import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { getComparativoVRPO } from '@/application/usecases/comparativoActions'
import { ComparativoVRPOPage } from '@/presentation/components/comparativo-vrpo/ComparativoVRPOPage'

export default async function ComparativoVRPORoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const data = await getComparativoVRPO(userId)

  return <ComparativoVRPOPage data={data} />
}

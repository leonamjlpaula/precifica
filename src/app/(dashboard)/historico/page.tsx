import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { listSnapshots } from '@/application/usecases/snapshotActions'
import { HistoricoPage } from '@/presentation/components/historico/HistoricoPage'

export default async function HistoricoRoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const snapshots = await listSnapshots(userId)

  return <HistoricoPage userId={userId} initialSnapshots={snapshots} />
}

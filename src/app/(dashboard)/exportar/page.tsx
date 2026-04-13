import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { getExportData } from '@/application/usecases/exportActions'
import { ExportarPage } from '@/presentation/components/exportar/ExportarPage'

export default async function ExportarRoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const data = await getExportData(userId)

  return <ExportarPage data={data} />
}

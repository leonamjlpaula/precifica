import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getExportData } from '@/application/usecases/exportActions'
import { ExportarPage } from '@/presentation/components/exportar/ExportarPage'

export default async function ExportarRoute() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const data = await getExportData(session.user.id)

  return <ExportarPage data={data} />
}

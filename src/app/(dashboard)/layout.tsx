import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/presentation/components/layout/DashboardLayout'

export default async function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userName = session.user?.name ?? 'Usuário'

  return (
    <DashboardLayout userName={userName}>
      {children}
    </DashboardLayout>
  )
}

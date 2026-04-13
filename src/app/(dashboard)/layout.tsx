import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/supabase/server'
import { DashboardLayout } from '@/presentation/components/layout/DashboardLayout'

export default async function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  const userName = user.user_metadata?.nome ?? user.email ?? 'Usuário'

  return (
    <DashboardLayout userName={userName}>
      {children}
    </DashboardLayout>
  )
}

import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  getDashboardStats,
  getTopProcedimentos,
  getBottomProcedimentosVRPO,
} from '@/application/usecases/dashboardActions'
import { DashboardPage } from '@/presentation/components/dashboard/DashboardPage'

export default async function DashboardRoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  

  const [stats, topProcedimentos, bottomVRPO, profile] = await Promise.all([
    getDashboardStats(userId),
    getTopProcedimentos(userId, 5),
    getBottomProcedimentosVRPO(userId, 5),
    prisma.user.findUnique({ where: { id: userId }, select: { onboardingCompleted: true } }),
  ])

  return (
    <DashboardPage
      userId={userId}
      stats={stats}
      topProcedimentos={topProcedimentos}
      bottomVRPO={bottomVRPO}
      lastUpdate={stats.lastUpdate}
      onboardingCompleted={profile?.onboardingCompleted ?? true}
    />
  )
}

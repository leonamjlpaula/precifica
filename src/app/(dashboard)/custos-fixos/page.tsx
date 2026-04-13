import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { getCustoFixoConfig } from '@/application/usecases/custoFixoActions'
import { CustosFixosForm } from '@/presentation/components/custos-fixos/CustosFixosForm'

export default async function CustosFixosPage() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  
  const data = await getCustoFixoConfig(userId)

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Custos Fixos</h1>
        <p className="text-muted-foreground">
          Configuração não encontrada. Por favor, entre em contato com o suporte.
        </p>
      </div>
    )
  }

  return (
    <CustosFixosForm
      userId={userId}
      initialConfig={data.config}
      initialItems={data.items}
    />
  )
}

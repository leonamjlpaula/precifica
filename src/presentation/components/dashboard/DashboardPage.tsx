'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/presentation/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/presentation/components/ui/dialog'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { useToast } from '@/presentation/hooks/use-toast'
import { Camera } from 'lucide-react'
import { createSnapshot } from '@/application/usecases/snapshotActions'
import { OnboardingWizard } from '@/presentation/components/layout/OnboardingWizard'
import type { DashboardStats, TopProcedimento, ProcedimentoNoVermelho } from '@/application/usecases/dashboardActions'

type Props = {
  userId: string
  stats: DashboardStats
  topProcedimentos: TopProcedimento[]
  procedimentosNoVermelho: ProcedimentoNoVermelho[]
  lastUpdate: Date | null
  onboardingCompleted: boolean
  perfilConsultorio: string | null
  totalProcedimentosNoVermelho: number
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}


export function DashboardPage({
  userId,
  stats,
  topProcedimentos,
  procedimentosNoVermelho,
  lastUpdate,
  onboardingCompleted,
  perfilConsultorio,
  totalProcedimentosNoVermelho,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [snapshotOpen, setSnapshotOpen] = useState(false)
  const [snapNome, setSnapNome] = useState('')
  const [snapDesc, setSnapDesc] = useState('')
  const [snapError, setSnapError] = useState<string | null>(null)

  // custosDesatualizados e ociosidadeNaoConfigurada vêm do servidor via stats
  const hasAlertas =
    totalProcedimentosNoVermelho > 0 ||
    stats.custosDesatualizados ||
    stats.ociosidadeNaoConfigurada

  function handleSnapshotOpen() {
    setSnapNome('')
    setSnapDesc('')
    setSnapError(null)
    setSnapshotOpen(true)
  }

  function handleSnapshotSubmit() {
    if (!snapNome.trim()) {
      setSnapError('Nome é obrigatório')
      return
    }
    startTransition(async () => {
      const result = await createSnapshot(userId, snapNome.trim(), snapDesc.trim() || undefined)
      if (!result.success) {
        setSnapError(result.error ?? 'Erro ao salvar registro')
        return
      }
      setSnapshotOpen(false)
      toast({ title: 'Registro salvo!', description: 'Acesse o Histórico para visualizá-lo.' })
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {!onboardingCompleted && (
        <OnboardingWizard userId={userId} perfilConsultorio={perfilConsultorio} />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSnapshotOpen} disabled={isPending}>
          <Camera className="mr-2 h-4 w-4" />
          Registrar Precificação Atual
        </Button>
      </div>

      {/* Snapshot Dialog */}
      <Dialog open={snapshotOpen} onOpenChange={setSnapshotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Precificação Atual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dash-snap-nome">Nome *</Label>
              <Input
                id="dash-snap-nome"
                value={snapNome}
                onChange={(e) => { setSnapNome(e.target.value); setSnapError(null) }}
                placeholder="Ex: Março 2026"
                onKeyDown={(e) => e.key === 'Enter' && handleSnapshotSubmit()}
              />
              {snapError && <p className="text-sm text-destructive">{snapError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dash-snap-desc">Descrição (opcional)</Label>
              <Input
                id="dash-snap-desc"
                value={snapDesc}
                onChange={(e) => setSnapDesc(e.target.value)}
                placeholder="Ex: Antes do reajuste de materiais"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSnapshotSubmit} disabled={isPending}>
              {isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Atenção necessária */}
      {hasAlertas && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Atenção necessária</h2>
          {totalProcedimentosNoVermelho > 0 && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              🔴 {totalProcedimentosNoVermelho} procedimento
              {totalProcedimentosNoVermelho > 1 ? 's' : ''} com margem abaixo de 10%.{' '}
              <Link href="/procedimentos/diagnostico" className="font-medium underline underline-offset-2">
                Ver procedimentos
              </Link>
            </div>
          )}
          {stats.custosDesatualizados && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              ⚠️ Os custos fixos não são atualizados há mais de 6 meses. Revise os valores para manter
              sua precificação precisa.{' '}
              <Link href="/custos-fixos" className="font-medium underline underline-offset-2">
                Atualizar agora
              </Link>
            </div>
          )}
          {stats.ociosidadeNaoConfigurada && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              💡 Sua taxa de ociosidade está em 0%. Clínicas típicas ficam com 20% do tempo ocioso —
              configurar esse valor torna o custo por minuto mais realista.{' '}
              <Link href="/custos-fixos" className="font-medium underline underline-offset-2">
                Configurar agora
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/custos-fixos" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Custo Fixo por Minuto</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {formatBRL(stats.custoFixoPorMinuto)}
                <span className="ml-1 text-lg font-normal text-muted-foreground">/ min</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Clique para editar os custos fixos</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Custos Fixos Mensais</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatBRL(stats.totalCustosFixosMensais)}
              <span className="ml-1 text-lg font-normal text-muted-foreground">/ mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {lastUpdate
                ? `Atualizado em ${new Date(lastUpdate).toLocaleDateString('pt-BR')}`
                : 'Nenhuma configuração salva'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Procedimentos Cadastrados</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.totalProcedimentos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.totalMateriais} materiais cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakeven card */}
      {stats.breakEven.comProLabore > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pontos de Equilíbrio Mensal</CardTitle>
            <CardDescription>
              Estimativa com ocupação 100% — quanto você precisa faturar para cobrir cada nível de custo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-orange-900">Para pagar os custos do consultório</p>
                <p className="text-xs text-orange-700 mt-0.5">Itens fixos + depreciação + retorno (sem pró-labore)</p>
              </div>
              <span className="text-lg font-bold tabular-nums text-orange-900 ml-4 shrink-0">
                {formatBRL(stats.breakEven.semProLabore)}<span className="text-sm font-normal">/mês</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-green-900">Para se pagar (custos + pró-labore)</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Inclui pró-labore de {formatBRL(stats.breakEven.proLaboreMensal)}/mês — acima disso é lucro
                </p>
              </div>
              <span className="text-lg font-bold tabular-nums text-green-900 ml-4 shrink-0">
                {formatBRL(stats.breakEven.comProLabore)}<span className="text-sm font-normal">/mês</span>
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-purple-900">Faturamento mínimo semanal</p>
                <p className="text-xs text-purple-700 mt-0.5">Break-even mensal (sem pró-labore) ÷ 4 semanas</p>
              </div>
              <span className="text-lg font-bold tabular-nums text-purple-900 ml-4 shrink-0">
                {formatBRL(stats.breakEven.semProLabore / 4)}<span className="text-sm font-normal">/sem</span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top procedures */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procedimentos Mais Caros</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProcedimentos.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Nenhum procedimento calculado ainda.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Procedimento</th>
                    <th className="px-6 py-2 text-right font-medium">Preço Calculado</th>
                  </tr>
                </thead>
                <tbody>
                  {topProcedimentos.map((p, i) => (
                    <tr key={p.id} className={i < topProcedimentos.length - 1 ? 'border-b' : ''}>
                      <td className="px-6 py-3">
                        <Link
                          href={`/procedimentos/${p.especialidadeSlug}/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.especialidadeNome}</p>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {formatBRL(p.precoFinal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Procedimentos no vermelho */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-700">Procedimentos no Vermelho</CardTitle>
            <CardDescription>Margem abaixo de 10% — requer atenção</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {procedimentosNoVermelho.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Nenhum procedimento com margem abaixo de 10%. Configure o preço de venda nos procedimentos para monitorar.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Procedimento</th>
                    <th className="px-6 py-2 text-right font-medium">Margem</th>
                    <th className="px-6 py-2 text-right font-medium">Mín. 30%</th>
                  </tr>
                </thead>
                <tbody>
                  {procedimentosNoVermelho.map((p, i) => (
                    <tr key={p.id} className={i < procedimentosNoVermelho.length - 1 ? 'border-b' : ''}>
                      <td className="px-6 py-3">
                        <Link
                          href={`/procedimentos/${p.especialidadeSlug}/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.especialidadeNome}</p>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium text-red-600">
                        {(p.margemLucro * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {formatBRL(p.precoMinimoParaMargem30)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/custos-fixos">Editar Custos Fixos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/procedimentos/diagnostico">Ver Todos os Procedimentos</Link>
        </Button>
      </div>
    </div>
  )
}

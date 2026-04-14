'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Eye, Trash2, ArrowLeft, GitCompare, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/presentation/components/ui/button'
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
import {
  createSnapshot,
  deleteSnapshot,
  getSnapshot,
  compareSnapshotWithCurrent,
  type SnapshotListItem,
  type SnapshotFull,
  type ComparisonResult,
  type CustoItemDiff,
} from '@/application/usecases/snapshotActions'

const SNAPSHOT_LIMIT = 10

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatPerc(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'snapshot' | 'comparison'

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  userId: string
  initialSnapshots: SnapshotListItem[]
}

export function HistoricoPage({ userId, initialSnapshots }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [snapshots, setSnapshots] = useState<SnapshotListItem[]>(initialSnapshots)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotFull | null>(null)
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null)

  // Create snapshot modal
  const [createOpen, setCreateOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleCreateOpen() {
    setNome('')
    setDescricao('')
    setCreateError(null)
    setCreateOpen(true)
  }

  function handleCreateSubmit() {
    if (!nome.trim()) {
      setCreateError('Nome é obrigatório')
      return
    }

    startTransition(async () => {
      const result = await createSnapshot(userId, nome.trim(), descricao.trim() || undefined)
      if (!result.success) {
        setCreateError(result.error ?? 'Erro ao salvar snapshot')
        return
      }
      setCreateOpen(false)
      toast({ title: 'Registro salvo com sucesso!' })
      router.refresh()
      // Refresh local list
      const { listSnapshots } = await import('@/application/usecases/snapshotActions')
      const updated = await listSnapshots(userId)
      setSnapshots(updated)
    })
  }

  function handleView(id: string) {
    startTransition(async () => {
      const snapshot = await getSnapshot(id, userId)
      if (!snapshot) {
        toast({ title: 'Registro não encontrado', variant: 'destructive' })
        return
      }
      setSelectedSnapshot(snapshot)
      setComparisonData(null)
      setViewMode('snapshot')
    })
  }

  function handleCompare(id: string) {
    startTransition(async () => {
      const [snapshot, comparison] = await Promise.all([
        getSnapshot(id, userId),
        compareSnapshotWithCurrent(id, userId),
      ])
      if (!snapshot) {
        toast({ title: 'Registro não encontrado', variant: 'destructive' })
        return
      }
      setSelectedSnapshot(snapshot)
      setComparisonData(comparison)
      setViewMode('comparison')
    })
  }

  function handleDeleteConfirm() {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)

    startTransition(async () => {
      const result = await deleteSnapshot(id, userId)
      if (!result.success) {
        toast({ title: result.error ?? 'Erro ao excluir registro', variant: 'destructive' })
        return
      }
      toast({ title: 'Registro excluído' })
      setSnapshots((prev) => prev.filter((s) => s.id !== id))
      if (selectedSnapshot?.id === id) {
        setViewMode('list')
        setSelectedSnapshot(null)
      }
    })
  }

  function handleBackToList() {
    setViewMode('list')
    setSelectedSnapshot(null)
    setComparisonData(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Registros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registre versões da sua precificação e compare sua evolução ao longo do tempo.
          </p>
        </div>
        <Button onClick={handleCreateOpen} disabled={snapshots.length >= SNAPSHOT_LIMIT || isPending}>
          <Camera className="mr-2 h-4 w-4" />
          Registrar Precificação Atual
        </Button>
      </div>

      {/* Snapshot counter */}
      <p className="text-sm text-muted-foreground">
        <span
          className={cn(
            'font-medium',
            snapshots.length >= SNAPSHOT_LIMIT ? 'text-destructive' : 'text-foreground'
          )}
        >
          {snapshots.length}/{SNAPSHOT_LIMIT} registros
        </span>{' '}
        {snapshots.length >= SNAPSHOT_LIMIT && (
          <span className="text-destructive">— limite atingido. Exclua um para criar outro.</span>
        )}
      </p>

      {/* Main content */}
      {viewMode === 'list' && (
        <SnapshotList
          snapshots={snapshots}
          isPending={isPending}
          onView={handleView}
          onCompare={handleCompare}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      {viewMode === 'snapshot' && selectedSnapshot && (
        <SnapshotView
          snapshot={selectedSnapshot}
          isPending={isPending}
          onBack={handleBackToList}
          onCompare={() => handleCompare(selectedSnapshot.id)}
          onDelete={() => setDeleteId(selectedSnapshot.id)}
        />
      )}

      {viewMode === 'comparison' && selectedSnapshot && comparisonData && (
        <ComparisonView
          snapshot={selectedSnapshot}
          result={comparisonData}
          onBack={handleBackToList}
        />
      )}

      {/* Create Snapshot Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Precificação Atual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="snapshot-nome">Nome *</Label>
              <Input
                id="snapshot-nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setCreateError(null)
                }}
                placeholder="Ex: Março 2026 — antes do reajuste"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSubmit()}
              />
              {createError && <p className="text-sm text-destructive">{createError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="snapshot-desc">Descrição (opcional)</Label>
              <Input
                id="snapshot-desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Configuração com novos materiais importados"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleCreateSubmit} disabled={isPending}>
              {isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir registro?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. O registro será removido permanentemente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isPending}>
              {isPending ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── SnapshotList ─────────────────────────────────────────────────────────────

type SnapshotListProps = {
  snapshots: SnapshotListItem[]
  isPending: boolean
  onView: (id: string) => void
  onCompare: (id: string) => void
  onDelete: (id: string) => void
}

function SnapshotList({ snapshots, isPending, onView, onCompare, onDelete }: SnapshotListProps) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Nenhum registro salvo. Registre o estado atual da sua precificação.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3 hidden sm:table-cell">Descrição</th>
            <th className="px-4 py-3 text-right">Custo/min</th>
            <th className="px-4 py-3 hidden md:table-cell">Data</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map((snapshot) => (
            <tr key={snapshot.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{snapshot.nome}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                {snapshot.descricao ?? '—'}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {formatBRL(snapshot.custoFixoPorMinuto)}/min
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                {formatDate(snapshot.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(snapshot.id)}
                    disabled={isPending}
                    title="Ver registro"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCompare(snapshot.id)}
                    disabled={isPending}
                    title="Comparar com atual"
                  >
                    <GitCompare className="h-4 w-4" />
                    <span className="sr-only">Comparar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(snapshot.id)}
                    disabled={isPending}
                    title="Excluir registro"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── SnapshotView ─────────────────────────────────────────────────────────────

type SnapshotViewProps = {
  snapshot: SnapshotFull
  isPending: boolean
  onBack: () => void
  onCompare: () => void
  onDelete: () => void
}

function SnapshotView({ snapshot, isPending, onBack, onCompare, onDelete }: SnapshotViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{snapshot.nome}</h2>
          {snapshot.descricao && (
            <p className="mt-0.5 text-sm text-muted-foreground">{snapshot.descricao}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(snapshot.createdAt)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onCompare} disabled={isPending}>
            <GitCompare className="mr-2 h-4 w-4" />
            {isPending ? 'Carregando…' : 'Comparar com Atual'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Custo fixo por minuto nesta versão: </span>
        <span className="font-semibold tabular-nums">
          {formatBRL(snapshot.dados.custoFixoPorMinuto)}/min
        </span>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Procedimento</th>
                <th className="px-4 py-3 hidden sm:table-cell">Especialidade</th>
                <th className="px-4 py-3 text-right">Preço Calculado</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.dados.procedimentos.map((proc) => (
                <tr key={proc.procedimentoId} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {proc.codigo}
                  </td>
                  <td className="px-4 py-3">{proc.nome}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                    {proc.especialidadeNome}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatBRL(proc.precoCalculado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {snapshot.dados.procedimentos.length} procedimentos neste registro
      </p>
    </div>
  )
}

// ─── ComparisonView ───────────────────────────────────────────────────────────

type ComparisonViewProps = {
  snapshot: SnapshotFull
  result: ComparisonResult
  onBack: () => void
}

function ComparisonView({ snapshot, result, onBack }: ComparisonViewProps) {
  const { procedimentos: comparison, custoItemsDiff } = result

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold">
          Comparativo: <span className="text-muted-foreground">{snapshot.nome}</span> vs. Atual
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Registro de {formatDate(snapshot.createdAt)}
        </p>
      </div>

      {/* ── Variações nos custos fixos ─────────────────────────────────── */}
      {custoItemsDiff.length > 0 && (
        <CustoItemsDiffSection items={custoItemsDiff} />
      )}

      {/* ── Tabela de procedimentos ────────────────────────────────────── */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Procedimento</th>
                <th className="px-4 py-3 hidden sm:table-cell text-muted-foreground">Especialidade</th>
                <th className="px-4 py-3 text-right">Preço na Versão</th>
                <th className="px-4 py-3 text-right">Preço Atual</th>
                <th className="px-4 py-3 text-right">Diferença R$</th>
                <th className="px-4 py-3 text-right">Diferença %</th>
              </tr>
            </thead>
            <tbody>
              {comparison.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum dado para comparar.
                  </td>
                </tr>
              ) : (
                comparison.map((item) => (
                  <tr key={item.codigo} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="font-medium">{item.nome}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {item.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                      {item.especialidadeNome}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatBRL(item.precoSnapshot)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.precoAtual > 0 ? formatBRL(item.precoAtual) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right tabular-nums',
                        item.diferenca > 0
                          ? 'text-green-700'
                          : item.diferenca < 0
                            ? 'text-red-700'
                            : 'text-muted-foreground'
                      )}
                    >
                      {item.precoAtual > 0 ? formatBRL(item.diferenca) : '—'}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right tabular-nums font-medium',
                        item.diferencaPerc > 0
                          ? 'text-green-700'
                          : item.diferencaPerc < 0
                            ? 'text-red-700'
                            : 'text-muted-foreground'
                      )}
                    >
                      {item.precoAtual > 0 ? formatPerc(item.diferencaPerc) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{comparison.length} procedimentos comparados</p>
    </div>
  )
}

// ─── CustoItemsDiffSection ────────────────────────────────────────────────────

function CustoItemsDiffSection({ items }: { items: CustoItemDiff[] }) {
  return (
    <div className="rounded-md border">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Variações nos custos fixos</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Itens que mudaram de valor entre este registro e o estado atual
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">Item</th>
              <th className="px-4 py-2 text-right font-medium">Valor no registro</th>
              <th className="px-4 py-2 text-right font-medium">Valor atual</th>
              <th className="px-4 py-2 text-right font-medium">Variação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.nome} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2 font-medium">{item.nome}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                  {item.valorSnapshot > 0 ? formatBRL(item.valorSnapshot) : '—'}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {item.valorAtual > 0 ? formatBRL(item.valorAtual) : (
                    <span className="text-muted-foreground">Removido</span>
                  )}
                </td>
                <td
                  className={cn(
                    'px-4 py-2 text-right tabular-nums font-medium',
                    item.delta > 0 ? 'text-red-600' : 'text-green-600',
                  )}
                >
                  {item.delta > 0 ? '+' : ''}{formatBRL(item.delta)}
                  <span className="ml-1 text-xs font-normal">
                    ({item.deltaPerc > 0 ? '+' : ''}{item.deltaPerc.toFixed(1)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

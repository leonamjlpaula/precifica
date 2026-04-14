'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import * as Popover from '@radix-ui/react-popover'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ComparativoVRPOData,
  ComparativoSituacao,
} from '@/application/usecases/comparativoActions'

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatPerc(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type SituacaoFilter = 'todos' | ComparativoSituacao

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data: ComparativoVRPOData
}

export function ComparativoVRPOPage({ data }: Props) {
  const { items, especialidades, totalAbaixo, totalAcima, totalSemReferencia } = data

  const [situacaoFilter, setSituacaoFilter] = useState<SituacaoFilter>('todos')
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>('todas')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (situacaoFilter !== 'todos' && item.situacao !== situacaoFilter) return false
      if (especialidadeFilter !== 'todas' && item.especialidadeSlug !== especialidadeFilter)
        return false
      return true
    })
  }, [items, situacaoFilter, especialidadeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  function handleSituacaoChange(value: string) {
    setSituacaoFilter(value as SituacaoFilter)
    setPage(1)
  }

  function handleEspecialidadeChange(value: string) {
    setEspecialidadeFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Comparativo VRPO</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Veja sua margem de negociação em relação à tabela VRPO — procedimentos abaixo do valor de referência têm menos espaço para desconto em convênios.
        </p>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleSituacaoChange('abaixo')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            situacaoFilter === 'abaixo'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          )}
        >
          {totalAbaixo} com margem reduzida (abaixo da VRPO)
        </button>
        <button
          onClick={() => handleSituacaoChange('acima')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            situacaoFilter === 'acima'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
          )}
        >
          {totalAcima} com folga para negociação (acima da VRPO)
        </button>
        <button
          onClick={() => handleSituacaoChange('sem_referencia')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            situacaoFilter === 'sem_referencia'
              ? 'border-gray-500 bg-gray-100 text-gray-700'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
          )}
        >
          {totalSemReferencia} sem referência VRPO
        </button>
        {situacaoFilter !== 'todos' && (
          <button
            onClick={() => handleSituacaoChange('todos')}
            className="rounded-full border border-muted px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted/50"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-especialidade" className="text-sm font-medium">
            Especialidade:
          </label>
          <select
            id="filter-especialidade"
            value={especialidadeFilter}
            onChange={(e) => handleEspecialidadeChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todas">Todas</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.codigo}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Procedimento</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3 text-right">Meu Preço</th>
                <th className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1">
                    VRPO Ref.
                    <VRPOPopover />
                  </span>
                </th>
                <th className="px-4 py-3 text-right">Diferença R$</th>
                <th className="px-4 py-3 text-right">Margem negoc.</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum procedimento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => {
                  const rowClass =
                    item.situacao === 'abaixo'
                      ? 'bg-red-50/60 hover:bg-red-50'
                      : item.situacao === 'acima'
                        ? 'bg-green-50/60 hover:bg-green-50'
                        : 'hover:bg-muted/30'

                  return (
                    <tr key={item.id} className={cn('border-b last:border-0', rowClass)}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {item.codigo}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/procedimentos/${item.especialidadeSlug}/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.nome}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.especialidadeNome}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatBRL(item.meuPreco)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {item.vrpoReferencia !== null ? formatBRL(item.vrpoReferencia) : '—'}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right tabular-nums',
                          item.diferencaReais === null
                            ? 'text-muted-foreground'
                            : item.diferencaReais >= 0
                              ? 'text-green-700'
                              : 'text-red-700'
                        )}
                      >
                        {item.diferencaReais !== null ? formatBRL(item.diferencaReais) : '—'}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right tabular-nums font-medium',
                          item.diferencaPerc === null
                            ? 'text-muted-foreground'
                            : item.diferencaPerc >= 0
                              ? 'text-green-700'
                              : 'text-red-700'
                        )}
                      >
                        {item.diferencaPerc !== null ? formatPerc(item.diferencaPerc) : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row count + pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Exibindo {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} procedimentos
            {filtered.length !== items.length && ` (filtrado de ${items.length})`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-xs hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 border rounded-md bg-muted/30">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md text-xs hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── VRPOPopover ──────────────────────────────────────────────────────────────

function VRPOPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label="O que é VRPO?"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 w-72 rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">O que é VRPO?</p>
            <Popover.Close className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </Popover.Close>
          </div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            VRPO (Valores Referenciais para Procedimentos Odontológicos) é a tabela de referência
            publicada pelo CFO que orienta a precificação mínima dos procedimentos odontológicos.
            Procedimentos com preço calculado abaixo da VRPO têm menos margem para oferecer desconto sem prejudicar a saúde financeira do consultório. A VRPO é frequentemente exigida em credenciamentos de convênios.
          </p>
          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

'use client'

import { useState, useMemo, useTransition } from 'react'
import { FileText, FileSpreadsheet, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExportData, ExportPreviewItem } from '@/application/usecases/exportActions'

// ─── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

type TipoFilter = 'all' | 'standard' | 'custom'

// ─── Formatters ────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data: ExportData
}

export function ExportarPage({ data }: Props) {
  const { items, especialidades } = data

  const [especialidade, setEspecialidade] = useState<string>('all')
  const [tipo, setTipo] = useState<TipoFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadingPdf, startPdfTransition] = useTransition()
  const [downloadingExcel, startExcelTransition] = useTransition()

  // Filter items based on selected filters
  const filteredItems = useMemo(() => {
    return items.filter((item: ExportPreviewItem) => {
      if (especialidade !== 'all' && item.especialidadeSlug !== especialidade) return false
      if (tipo === 'standard' && item.isCustom) return false
      if (tipo === 'custom' && !item.isCustom) return false
      return true
    })
  }, [items, especialidade, tipo])

  // Paginate filtered items
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filteredItems.slice(pageStart, pageStart + PAGE_SIZE)

  // Reset to page 1 when filters change
  function handleEspecialidadeChange(value: string) {
    setEspecialidade(value)
    setCurrentPage(1)
  }

  function handleTipoChange(value: TipoFilter) {
    setTipo(value)
    setCurrentPage(1)
  }

  // Build query string for download URLs
  function buildQueryParams() {
    const params = new URLSearchParams()
    params.set('especialidade', especialidade)
    params.set('tipo', tipo)
    return params.toString()
  }

  // Download via fetch + blob
  function handleDownload(format: 'pdf' | 'excel') {
    const url =
      format === 'pdf'
        ? `/api/export/pdf?${buildQueryParams()}`
        : `/api/export/excel?${buildQueryParams()}`

    const startFn = format === 'pdf' ? startPdfTransition : startExcelTransition

    startFn(async () => {
      const response = await fetch(url)
      if (!response.ok) return

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl

      // Extract filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : format === 'pdf' ? 'precifica.pdf' : 'precifica.xlsx'

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Exportar Tabela de Preços</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Baixe sua tabela de procedimentos em PDF ou Excel para apresentar a convênios e pacientes.
        </p>
      </div>

      {/* Filters + Download buttons */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filtros de exportação
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          {/* Especialidade filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-especialidade" className="text-sm font-medium">
              Especialidade
            </label>
            <select
              id="filter-especialidade"
              value={especialidade}
              onChange={(e) => handleEspecialidadeChange(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todas</option>
              {especialidades.map((e) => (
                <option key={e.id} value={e.codigo}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo filter */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-tipo" className="text-sm font-medium">
              Tipo
            </label>
            <select
              id="filter-tipo"
              value={tipo}
              onChange={(e) => handleTipoChange(e.target.value as TipoFilter)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              <option value="standard">Apenas Padrão VRPO</option>
              <option value="custom">Apenas Customizados</option>
            </select>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Download buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloadingPdf || filteredItems.length === 0}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {downloadingPdf ? (
                <Download className="h-4 w-4 animate-bounce" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {downloadingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
            <button
              onClick={() => handleDownload('excel')}
              disabled={downloadingExcel || filteredItems.length === 0}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {downloadingExcel ? (
                <Download className="h-4 w-4 animate-bounce" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              {downloadingExcel ? 'Gerando Excel...' : 'Baixar Excel'}
            </button>
          </div>
        </div>

        {/* Filter summary */}
        <p className="mt-3 text-xs text-muted-foreground">
          {filteredItems.length === 0
            ? 'Nenhum procedimento encontrado com os filtros selecionados.'
            : `${filteredItems.length} procedimento${filteredItems.length !== 1 ? 's' : ''} serão exportados`}
        </p>
      </div>

      {/* Preview table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Prévia da exportação
        </h2>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Procedimento</th>
                  <th className="px-4 py-3">Especialidade</th>
                  <th className="px-4 py-3 text-right">Tempo (min)</th>
                  <th className="px-4 py-3 text-right">Custo Variável</th>
                  <th className="px-4 py-3 text-right">Preço Calculado</th>
                  <th className="px-4 py-3 text-right">VRPO Ref.</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      Nenhum procedimento encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {item.codigo}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium">{item.nome}</span>
                        {item.isCustom && (
                          <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                            Customizado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {item.especialidadeNome}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {item.tempoMinutos}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatBRL(item.custoVariavel)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        {formatBRL(item.precoFinal)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {item.vrpoReferencia !== null ? formatBRL(item.vrpoReferencia) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredItems.length > PAGE_SIZE && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Exibindo {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredItems.length)} de{' '}
              {filteredItems.length} procedimentos
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded p-1 hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded p-1 hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

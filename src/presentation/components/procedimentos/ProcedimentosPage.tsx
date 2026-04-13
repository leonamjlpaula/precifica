'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import type { Especialidade } from '@prisma/client'
import type { ProcedimentoComPreco } from '@/application/usecases/procedimentoActions'
import { createProcedimentoCustomizado } from '@/application/usecases/procedimentoActions'
import { margemColor } from '@/application/usecases/calcularPrecoProcedimento'
import { useToast } from '@/presentation/hooks/use-toast'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog'
import { cn } from '@/lib/utils'

type EspecialidadeWithCount = Especialidade & { count: number }

interface Props {
  userId: string
  especialidades: EspecialidadeWithCount[]
  currentEspecialidade: Especialidade
  initialProcedimentos: ProcedimentoComPreco[]
  initialSearchQuery: string
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function MargemBadge({ margemLucro, precoMinimoParaMargem30 }: { margemLucro: number | null; precoMinimoParaMargem30: number }) {
  const color = margemColor(margemLucro)

  if (color === null) {
    return (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Mín: {formatBRL(precoMinimoParaMargem30)}
      </span>
    )
  }

  const pct = (margemLucro! * 100).toFixed(1)
  const colorClass =
    color === 'green'
      ? 'bg-green-100 text-green-800 border-green-200'
      : color === 'yellow'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-red-100 text-red-800 border-red-200'

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border tabular-nums', colorClass)}>
      {pct}%
    </span>
  )
}

export function ProcedimentosPage({
  userId,
  especialidades,
  currentEspecialidade,
  initialProcedimentos,
  initialSearchQuery,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addCodigo, setAddCodigo] = useState('')
  const [addNome, setAddNome] = useState('')
  const [addTempo, setAddTempo] = useState('')
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  const isSearching = !!initialSearchQuery

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(
        `/procedimentos/${currentEspecialidade.codigo}?q=${encodeURIComponent(q)}`
      )
    } else {
      router.push(`/procedimentos/${currentEspecialidade.codigo}`)
    }
  }

  function resetAddForm() {
    setAddCodigo('')
    setAddNome('')
    setAddTempo('')
    setAddErrors({})
  }

  function handleAddProcedimento() {
    const errors: Record<string, string> = {}
    if (!addCodigo.trim()) errors.codigo = 'Código é obrigatório'
    if (!addNome.trim()) errors.nome = 'Nome é obrigatório'
    const tempo = parseFloat(addTempo.replace(',', '.'))
    if (isNaN(tempo) || tempo <= 0) errors.tempo = 'Tempo deve ser maior que zero'
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors)
      return
    }

    startTransition(async () => {
      const result = await createProcedimentoCustomizado(
        userId,
        currentEspecialidade.id,
        addCodigo.trim(),
        addNome.trim(),
        tempo
      )
      if (result.success) {
        setIsAddOpen(false)
        resetAddForm()
        toast({
          title: 'Procedimento adicionado!',
          description: `${addNome} criado com sucesso.`,
        })
        router.refresh()
      } else {
        const fieldErrors: Record<string, string> = {}
        if (result.errors?.codigo) fieldErrors.codigo = result.errors.codigo[0]
        if (result.errors?.nome) fieldErrors.nome = result.errors.nome[0]
        if (result.errors?.tempo) fieldErrors.tempo = result.errors.tempo[0]
        if (Object.keys(fieldErrors).length > 0) {
          setAddErrors(fieldErrors)
        } else {
          toast({
            title: 'Erro ao criar',
            description: result.errors?.general?.join(', ') ?? 'Tente novamente.',
            variant: 'destructive',
          })
        }
      }
    })
  }

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar — especialidades nav */}
      <aside className="hidden md:flex flex-col w-52 shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Especialidades
        </h2>
        <nav className="space-y-1">
          {especialidades.map((esp) => {
            const isActive = esp.id === currentEspecialidade.id && !isSearching
            return (
              <Link
                key={esp.id}
                href={`/procedimentos/${esp.codigo}`}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="truncate">{esp.nome}</span>
                <span
                  className={cn(
                    'ml-2 text-xs px-1.5 py-0.5 rounded-full shrink-0 tabular-nums',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {esp.count}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Mobile: especialidade dropdown */}
        <div className="md:hidden">
          <select
            value={currentEspecialidade.codigo}
            onChange={(e) => router.push(`/procedimentos/${e.target.value}`)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          >
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.codigo}>
                {esp.nome} ({esp.count})
              </option>
            ))}
          </select>
        </div>

        {/* Header + Add button */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              {isSearching
                ? `Resultados para "${initialSearchQuery}"`
                : currentEspecialidade.nome}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {initialProcedimentos.length} procedimento(s)
            </p>
          </div>
          <Button onClick={() => { resetAddForm(); setIsAddOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Procedimento
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por código ou nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
          {isSearching && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchQuery('')
                router.push(`/procedimentos/${currentEspecialidade.codigo}`)
              }}
            >
              Limpar
            </Button>
          )}
        </form>

        {/* Procedures table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Tempo (min)
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Custo Variável
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Preço Calculado
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Margem
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    VRPO Ref.
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Diferença (%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialProcedimentos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isSearching
                        ? 'Nenhum procedimento encontrado para a busca.'
                        : 'Nenhum procedimento cadastrado para esta especialidade.'}
                    </td>
                  </tr>
                ) : (
                  initialProcedimentos.map(({ procedimento, precoCalculado, vrpoReferencia }) => {
                    const diferenca =
                      vrpoReferencia !== null
                        ? ((precoCalculado.precoFinal - vrpoReferencia) / vrpoReferencia) * 100
                        : null

                    const diferencaColor =
                      diferenca === null
                        ? 'text-muted-foreground'
                        : diferenca >= 0
                          ? 'text-green-600'
                          : 'text-red-600'

                    const especialidadeSlug = procedimento.especialidade.codigo

                    return (
                      <tr
                        key={procedimento.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/procedimentos/${especialidadeSlug}/${procedimento.id}`
                          )
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{procedimento.codigo}</span>
                            {procedimento.isCustom && (
                              <Badge variant="outline" className="text-xs">
                                Customizado
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{procedimento.nome}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                          {procedimento.tempoMinutos}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatBRL(precoCalculado.custoVariavel)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {formatBRL(precoCalculado.precoFinal)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <MargemBadge
                            margemLucro={precoCalculado.margemLucro}
                            precoMinimoParaMargem30={precoCalculado.precoMinimoParaMargem30}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                          {vrpoReferencia !== null ? formatBRL(vrpoReferencia) : '—'}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 text-right font-medium tabular-nums',
                            diferencaColor
                          )}
                        >
                          {diferenca !== null ? formatPercentage(diferenca) : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Procedimento Dialog */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) resetAddForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Procedimento Customizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Especialidade: <strong>{currentEspecialidade.nome}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="add-codigo">Código</Label>
              <Input
                id="add-codigo"
                placeholder="Ex: 9001"
                value={addCodigo}
                onChange={(e) => setAddCodigo(e.target.value)}
              />
              {addErrors.codigo && (
                <p className="text-xs text-destructive">{addErrors.codigo}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-nome">Nome</Label>
              <Input
                id="add-nome"
                placeholder="Ex: Restauração composta posterior"
                value={addNome}
                onChange={(e) => setAddNome(e.target.value)}
              />
              {addErrors.nome && (
                <p className="text-xs text-destructive">{addErrors.nome}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-tempo">Tempo de execução (min)</Label>
              <Input
                id="add-tempo"
                type="number"
                placeholder="Ex: 45"
                value={addTempo}
                onChange={(e) => setAddTempo(e.target.value)}
                min={1}
                step={1}
              />
              {addErrors.tempo && (
                <p className="text-xs text-destructive">{addErrors.tempo}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false)
                resetAddForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddProcedimento} disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar Procedimento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

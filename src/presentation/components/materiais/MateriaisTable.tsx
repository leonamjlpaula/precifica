'use client'

import { useState, useMemo, useTransition } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import type { Material } from '@prisma/client'
import {
  getMateriais,
  updateMaterialPrice,
  createMaterial,
  deleteMaterial,
} from '@/application/usecases/materialActions'
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

interface Props {
  userId: string
  initialMateriais: Material[]
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function MateriaisTable({ userId, initialMateriais }: Props) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [materiais, setMateriais] = useState<Material[]>(initialMateriais)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPreco, setEditingPreco] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addNome, setAddNome] = useState('')
  const [addUnidade, setAddUnidade] = useState('')
  const [addPreco, setAddPreco] = useState('')
  const [addDivisorPadrao, setAddDivisorPadrao] = useState('1')
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return q ? materiais.filter((m) => m.nome.toLowerCase().includes(q)) : materiais
  }, [materiais, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  function startEdit(material: Material) {
    setEditingId(material.id)
    setEditingPreco(material.preco.toString())
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingPreco('')
  }

  function confirmEdit(material: Material) {
    const preco = parseFloat(editingPreco.replace(',', '.'))
    if (isNaN(preco) || preco <= 0) {
      toast({ title: 'Preço inválido', description: 'O preço deve ser maior que zero.', variant: 'destructive' })
      return
    }
    startTransition(async () => {
      const result = await updateMaterialPrice(material.id, userId, preco)
      if (result.success) {
        setMateriais((prev) => prev.map((m) => m.id === material.id ? { ...m, preco } : m))
        setEditingId(null)
        setEditingPreco('')
        const n = result.procedimentosNoVermelho ?? 0
        toast({
          title: 'Preço atualizado!',
          description:
            n > 0
              ? `${n} procedimento${n > 1 ? 's estão' : ' está'} abaixo de 10% de margem. Revise seus preços.`
              : `${material.nome} atualizado com sucesso.`,
        })
      } else {
        toast({
          title: 'Erro ao atualizar',
          description: result.errors?.general?.join(', ') ?? 'Tente novamente.',
          variant: 'destructive',
        })
      }
    })
  }

  function handleDelete(material: Material) {
    startTransition(async () => {
      const result = await deleteMaterial(material.id, userId)
      if (result.success) {
        setMateriais((prev) => prev.filter((m) => m.id !== material.id))
        toast({ title: 'Material excluído', description: `${material.nome} removido.` })
      } else {
        const procedimentos = result.errors?.procedimentos
        const detail = procedimentos && procedimentos.length > 0
          ? `Usado em: ${procedimentos.join(', ')}`
          : result.errors?.general?.join(', ') ?? 'Tente novamente.'
        toast({
          title: 'Não é possível excluir',
          description: detail,
          variant: 'destructive',
        })
      }
    })
  }

  function resetAddForm() {
    setAddNome('')
    setAddUnidade('')
    setAddPreco('')
    setAddDivisorPadrao('1')
    setAddErrors({})
  }

  function handleAddMaterial() {
    const errors: Record<string, string> = {}
    if (!addNome.trim()) errors.nome = 'Nome é obrigatório'
    if (!addUnidade.trim()) errors.unidade = 'Unidade é obrigatória'
    const preco = parseFloat(addPreco.replace(',', '.'))
    if (isNaN(preco) || preco <= 0) errors.preco = 'Preço deve ser maior que zero'
    const divisorPadrao = parseInt(addDivisorPadrao, 10)
    if (isNaN(divisorPadrao) || divisorPadrao < 1) errors.divisorPadrao = 'Divisor deve ser pelo menos 1'
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors)
      return
    }

    startTransition(async () => {
      const result = await createMaterial(userId, addNome.trim(), addUnidade.trim(), preco, divisorPadrao)
      if (result.success && result.material) {
        setMateriais((prev) => [...prev, result.material!].sort((a, b) => a.nome.localeCompare(b.nome)))
        setIsAddDialogOpen(false)
        resetAddForm()
        toast({ title: 'Material adicionado!', description: `${result.material.nome} cadastrado com sucesso.` })
      } else {
        const fieldErrors: Record<string, string> = {}
        if (result.errors?.nome) fieldErrors.nome = result.errors.nome[0]
        if (result.errors?.unidade) fieldErrors.unidade = result.errors.unidade[0]
        if (result.errors?.preco) fieldErrors.preco = result.errors.preco[0]
        if (Object.keys(fieldErrors).length > 0) {
          setAddErrors(fieldErrors)
        } else {
          toast({
            title: 'Erro ao adicionar',
            description: result.errors?.general?.join(', ') ?? 'Tente novamente.',
            variant: 'destructive',
          })
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Materiais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os materiais do consultório e seus preços.
          </p>
        </div>
        <Button onClick={() => { resetAddForm(); setIsAddDialogOpen(true) }}>
          + Adicionar Material
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar material pelo nome..."
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-12">Nº</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome do Material</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unidade</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Preço (R$)</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Nenhum material encontrado para a busca.' : 'Nenhum material cadastrado.'}
                  </td>
                </tr>
              ) : (
                paginated.map((material, index) => {
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + index
                  return (
                  <tr key={material.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{globalIndex + 1}</td>
                    <td className="px-4 py-3 font-medium">{material.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{material.unidade}</td>
                    <td className="px-4 py-3">
                      {material.isDefault ? (
                        <Badge variant="secondary">Padrão VRPO</Badge>
                      ) : (
                        <Badge variant="outline">Customizado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === material.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Input
                            type="number"
                            value={editingPreco}
                            onChange={(e) => setEditingPreco(e.target.value)}
                            className="w-28 h-8 text-right"
                            min={0}
                            step={0.01}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmEdit(material)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            onClick={() => confirmEdit(material)}
                            disabled={isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={cancelEdit}
                            disabled={isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span>{formatBRL(material.preco)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {editingId !== material.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(material)}
                            title="Editar preço"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {!material.isDefault && editingId !== material.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(material)}
                            disabled={isPending}
                            title="Excluir material"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Exibindo {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} materiais
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-1 border rounded-md bg-muted/30 text-xs">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Add Material Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetAddForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-nome">Nome</Label>
              <Input
                id="add-nome"
                placeholder="Ex: Resina composta"
                value={addNome}
                onChange={(e) => setAddNome(e.target.value)}
              />
              {addErrors.nome && <p className="text-xs text-destructive">{addErrors.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-unidade">Unidade</Label>
              <Input
                id="add-unidade"
                placeholder="Ex: caixa com 50"
                value={addUnidade}
                onChange={(e) => setAddUnidade(e.target.value)}
              />
              {addErrors.unidade && <p className="text-xs text-destructive">{addErrors.unidade}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-preco">Preço (R$)</Label>
              <Input
                id="add-preco"
                type="number"
                placeholder="0,00"
                value={addPreco}
                onChange={(e) => setAddPreco(e.target.value)}
                min={0}
                step={0.01}
              />
              {addErrors.preco && <p className="text-xs text-destructive">{addErrors.preco}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-divisor">Usos por embalagem</Label>
              <Input
                id="add-divisor"
                type="number"
                placeholder="1"
                value={addDivisorPadrao}
                onChange={(e) => setAddDivisorPadrao(e.target.value)}
                min={1}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Quantos procedimentos cabem em uma embalagem. Ex: caixa de 100 luvas → 100.
              </p>
              {addErrors.divisorPadrao && <p className="text-xs text-destructive">{addErrors.divisorPadrao}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetAddForm() }}>
              Cancelar
            </Button>
            <Button onClick={handleAddMaterial} disabled={isPending}>
              {isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

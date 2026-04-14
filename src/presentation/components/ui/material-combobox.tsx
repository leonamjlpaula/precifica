'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/presentation/components/ui/input'

interface MaterialOption {
  id: string
  nome: string
  unidade: string
  preco: number
  divisorPadrao: number
}

interface MaterialComboboxProps {
  options: MaterialOption[]
  onSelect: (id: string, divisorPadrao: number, unidade: string) => void
  onClear: () => void
  placeholder?: string
  disabled?: boolean
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function MaterialCombobox({
  options,
  onSelect,
  onClear,
  placeholder = 'Buscar material...',
  disabled,
}: MaterialComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [selected, setSelected] = useState<MaterialOption | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.nome.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
        if (!selected) setQuery('')
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [selected])

  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return
    const item = listRef.current.children[activeIdx] as HTMLElement
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function selectItem(option: MaterialOption) {
    setSelected(option)
    setQuery(option.nome)
    setOpen(false)
    setActiveIdx(-1)
    onSelect(option.id, option.divisorPadrao, option.unidade)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setSelected(null)
    setQuery('')
    setActiveIdx(-1)
    setOpen(false)
    onClear()
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && filtered[activeIdx]) selectItem(filtered[activeIdx])
      else if (filtered.length === 1) selectItem(filtered[0])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIdx(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {selected && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
            aria-label="Limpar seleção"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-md py-1 text-sm"
        >
          {filtered.map((option, idx) => (
            <li
              key={option.id}
              role="option"
              aria-selected={selected?.id === option.id}
              onPointerDown={(e) => {
                e.preventDefault()
                selectItem(option)
              }}
              className={cn(
                'flex items-center justify-between px-3 py-2 cursor-pointer',
                idx === activeIdx && 'bg-accent text-accent-foreground',
                selected?.id === option.id && idx !== activeIdx && 'bg-accent/40',
              )}
            >
              <span className="truncate">{option.nome}</span>
              <span className="ml-3 shrink-0 text-muted-foreground text-xs">
                {option.unidade}
                <span className="ml-2">{formatBRL(option.preco)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && query.trim() !== '' && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-md px-3 py-2 text-sm text-muted-foreground">
          Nenhum material encontrado.
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Camera, BookOpen, X, ArrowRight } from 'lucide-react'
import { createSnapshot } from '@/application/usecases/snapshotActions'
import { OnboardingWizard } from '@/presentation/components/layout/OnboardingWizard'

const GUIA_BANNER_KEY = 'odontovalor_guia_dispensado'

type Props = {
  userId: string
  onboardingCompleted: boolean
  perfilConsultorio: string | null
}

export function DashboardShell({ userId, onboardingCompleted, perfilConsultorio }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [snapshotOpen, setSnapshotOpen] = useState(false)
  const [snapNome, setSnapNome] = useState('')
  const [snapDesc, setSnapDesc] = useState('')
  const [snapError, setSnapError] = useState<string | null>(null)
  const guiaBannerRef = useRef<HTMLDivElement>(null)

  function dispensarGuiaBanner() {
    localStorage.setItem(GUIA_BANNER_KEY, '1')
    if (guiaBannerRef.current) guiaBannerRef.current.style.display = 'none'
  }

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
    <>
      {!onboardingCompleted && (
        <OnboardingWizard userId={userId} perfilConsultorio={perfilConsultorio} />
      )}

      {/* Banner rendered hidden on SSR; inline script shows it before hydration if not dismissed */}
      <div
        ref={guiaBannerRef}
        id="guia-banner-primeiros-passos"
        style={{ display: 'none' }}
        suppressHydrationWarning
        className="flex items-start gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-4"
      >
        <BookOpen className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Novo por aqui? Veja o guia de primeiros passos</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure seus custos, materiais e preços de venda em poucos minutos.
          </p>
          <Button asChild size="sm" variant="default" className="mt-3">
            <Link href="/primeiros-passos" onClick={dispensarGuiaBanner}>
              Ver guia <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <button
          onClick={dispensarGuiaBanner}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dispensar guia"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Static inline script — content is a compile-time constant, no user input, no XSS risk */}
      <script
        dangerouslySetInnerHTML={{
          __html: "(function(){try{if(!localStorage.getItem('odontovalor_guia_dispensado')){var b=document.getElementById('guia-banner-primeiros-passos');if(b)b.style.display=''}}catch(e){}})();",
        }}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSnapshotOpen} disabled={isPending}>
          <Camera className="mr-2 h-4 w-4" />
          Registrar Precificação Atual
        </Button>
      </div>

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
    </>
  )
}

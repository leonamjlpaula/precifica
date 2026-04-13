'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Users, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { cn } from '@/lib/utils'
import { updateOnboardingCompleted, savePerfilConsultorio } from '@/application/usecases/onboardingActions'

type WizardStep = 'perfil' | 'clinica-explicativo' | 1 | 2 | 3

type Props = {
  userId: string
  perfilConsultorio: string | null
}

const CONFIG_STEPS = [
  {
    step: 1 as const,
    title: 'Configure seus custos fixos',
    description:
      'Informe seus custos mensais do consultório (aluguel, energia, funcionários, etc.) para que o sistema calcule seu custo por minuto de trabalho.',
    actionLabel: 'Ir para Custos Fixos',
    href: '/custos-fixos',
  },
  {
    step: 2 as const,
    title: 'Atualize os preços dos materiais',
    description:
      'Revise e atualize os preços dos materiais odontológicos que você utiliza. Isso garante que os custos variáveis de cada procedimento sejam precisos.',
    actionLabel: 'Ir para Materiais',
    href: '/materiais',
  },
  {
    step: 3 as const,
    title: 'Veja seus procedimentos calculados',
    description:
      'Explore os procedimentos com os preços calculados automaticamente a partir dos seus custos. Compare com a tabela VRPO de referência.',
    actionLabel: 'Ver Procedimentos',
    href: '/procedimentos/diagnostico',
  },
]

export function OnboardingWizard({ userId, perfilConsultorio }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    perfilConsultorio === null ? 'perfil' : 1
  )
  const [selectedPerfil, setSelectedPerfil] = useState<'solo' | 'clinica' | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isPending, startTransition] = useTransition()

  if (!isVisible) return null

  async function handleSelectPerfil(perfil: 'solo' | 'clinica') {
    setSelectedPerfil(perfil)
    startTransition(async () => {
      await savePerfilConsultorio(userId, perfil)
      if (perfil === 'clinica') {
        setCurrentStep('clinica-explicativo')
      } else {
        setCurrentStep(1)
      }
    })
  }

  function handleBack() {
    if (currentStep === 'clinica-explicativo') setCurrentStep('perfil')
    else if (currentStep === 1) setCurrentStep('perfil')
    else if (currentStep === 2) setCurrentStep(1)
    else if (currentStep === 3) setCurrentStep(2)
  }

  function handleNext() {
    if (typeof currentStep === 'number' && currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3)
    }
  }

  async function handleSkip() {
    startTransition(async () => {
      await updateOnboardingCompleted(userId)
      setIsVisible(false)
      router.refresh()
    })
  }

  async function handleComplete() {
    startTransition(async () => {
      await updateOnboardingCompleted(userId)
      setIsVisible(false)
      router.refresh()
    })
  }

  const canGoBack =
    currentStep === 'clinica-explicativo' ||
    currentStep === 1 ||
    currentStep === 2 ||
    currentStep === 3

  const numericStep = typeof currentStep === 'number' ? currentStep : null
  const step = numericStep !== null ? CONFIG_STEPS[numericStep - 1] : null
  const progressPercent = numericStep !== null ? Math.round((numericStep / 3) * 100) : 0

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        {canGoBack && (
          <button
            onClick={handleBack}
            disabled={isPending}
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 w-fit"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Bem-vindo ao Precifica!</CardTitle>
            <CardDescription className="mt-0.5">
              {currentStep === 'perfil'
                ? 'Vamos configurar seu consultório do jeito certo para você.'
                : currentStep === 'clinica-explicativo'
                  ? 'Entenda como funciona o rateio por cadeiras.'
                  : 'Siga os passos abaixo para configurar seu consultório.'}
            </CardDescription>
          </div>

          {currentStep !== 'perfil' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isPending}
              className="shrink-0 text-muted-foreground"
            >
              Pular
            </Button>
          )}
        </div>

        {numericStep !== null && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Passo {numericStep} de 3
            </p>
            <div className="h-1.5 w-full rounded-full bg-blue-200">
              <div
                className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {/* ── Passo 0: Pergunta de perfil ─────────────────────────────────────── */}
      {currentStep === 'perfil' && (
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-foreground">Como você atende?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PerfilButton
              icon={<User className="h-5 w-5 text-blue-600" />}
              title="Atendo sozinho(a)"
              description="Consultório individual, 1 cadeira"
              onClick={() => handleSelectPerfil('solo')}
              disabled={isPending}
              selected={selectedPerfil === 'solo'}
            />
            <PerfilButton
              icon={<Users className="h-5 w-5 text-blue-600" />}
              title="Divido o espaço com outros dentistas"
              description="Clínica com 2 ou mais cadeiras ativas"
              onClick={() => handleSelectPerfil('clinica')}
              disabled={isPending}
              selected={selectedPerfil === 'clinica'}
            />
          </div>
        </CardContent>
      )}

      {/* ── Passo explicativo: clínica ──────────────────────────────────────── */}
      {currentStep === 'clinica-explicativo' && (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-foreground">Como funciona o rateio por cadeiras</h3>
            <p className="text-sm text-muted-foreground">
              Em uma clínica compartilhada, os custos fixos são divididos entre as cadeiras ativas.
            </p>
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
              <p className="font-medium text-blue-900">Exemplo:</p>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>Aluguel + energia + funcionários: <strong>R$ 5.000/mês</strong></li>
                <li>Cadeiras ativas na clínica: <strong>3</strong></li>
                <li className="border-t border-blue-200 pt-1">
                  Custo por cadeira: <strong>R$ 5.000 ÷ 3 = R$ 1.667/mês</strong>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Você vai configurar o número de cadeiras na próxima tela. Pode ajustar quando quiser.
            </p>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setCurrentStep(1)} disabled={isPending}>
              Entendi, vamos lá →
            </Button>
          </div>
        </CardContent>
      )}

      {/* ── Passos 1, 2, 3 ─────────────────────────────────────────────────── */}
      {numericStep !== null && step !== null && (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={step.href}>{step.actionLabel}</Link>
            </Button>

            {numericStep < 3 ? (
              <Button size="sm" onClick={handleNext} disabled={isPending}>
                Próximo
              </Button>
            ) : (
              <Button size="sm" onClick={handleComplete} disabled={isPending}>
                {isPending ? 'Concluindo…' : 'Concluir'}
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ─── PerfilButton ─────────────────────────────────────────────────────────────

type PerfilButtonProps = {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  disabled: boolean
  selected: boolean
}

function PerfilButton({ icon, title, description, onClick, disabled, selected }: PerfilButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border-2 bg-white p-4 text-left shadow-sm',
        'transition-all duration-150 cursor-pointer',
        'hover:border-blue-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected ? 'border-blue-500 shadow-md' : 'border-transparent',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground leading-snug">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors" />
    </button>
  )
}

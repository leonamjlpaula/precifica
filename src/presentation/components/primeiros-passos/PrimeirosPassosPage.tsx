'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'

const steps = [
  {
    number: 1,
    title: 'Configure seus Custos Fixos',
    description: 'Aluguel, salários, contas — o sistema calcula o custo por minuto automaticamente.',
    href: '/custos-fixos',
  },
  {
    number: 2,
    title: 'Atualize os preços dos materiais',
    description: 'Coloque os preços atuais dos insumos do seu consultório para precisão máxima.',
    href: '/materiais',
  },
  {
    number: 3,
    title: 'Veja os procedimentos calculados',
    description: 'Cada procedimento mostra o preço calculado com seus custos reais.',
    href: '/procedimentos/diagnostico',
  },
  {
    number: 4,
    title: 'Compare com a tabela VRPO',
    description: 'Veja quais procedimentos estão abaixo do valor de referência nacional.',
    href: '/comparativo-vrpo',
  },
]

const extras = [
  {
    title: 'Registre sua precificação',
    description: 'Guarda o estado atual dos preços para comparar com versões futuras.',
    href: '/historico',
    label: 'Ir para Histórico',
  },
  {
    title: 'Exporte para convênios',
    description: 'Gere PDF ou planilha com sua tabela de preços.',
    href: '/exportar',
    label: 'Ir para Exportar',
  },
]

export function PrimeirosPassosPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Primeiros Passos</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Sabe exatamente quanto custa cada procedimento no seu consultório? O Precifica usa a
          metodologia VRPO da CNCC para calcular o preço justo de cada procedimento com base nos
          seus custos reais.
        </p>
      </div>

      {/* Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona o cálculo</CardTitle>
          <CardDescription>Fórmula simplificada baseada na metodologia VRPO</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
            <div className="flex-1 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-semibold">Tempo (min)</p>
              <p className="mt-1 text-xs text-muted-foreground">duração do procedimento</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">×</span>
            <div className="flex-1 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-semibold">Custo Fixo/min</p>
              <p className="mt-1 text-xs text-muted-foreground">custo do consultório por minuto</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">+</span>
            <div className="flex-1 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-semibold">Custo Variável</p>
              <p className="mt-1 text-xs text-muted-foreground">materiais usados no procedimento</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">=</span>
            <div className="flex-1 rounded-lg border border-primary bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Preço Final</p>
              <p className="mt-1 text-xs text-muted-foreground">valor calculado com seus custos reais</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Passo a passo para começar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.number}
                  </span>
                  <CardTitle className="text-base leading-tight">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <Button asChild size="sm" variant="outline">
                  <Link href={step.href}>Ir para &rarr;</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Como tirar mais valor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {extras.map((extra) => (
            <Card key={extra.href}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Dica</Badge>
                  <CardTitle className="text-base">{extra.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{extra.description}</CardDescription>
                <Button asChild size="sm" variant="outline">
                  <Link href={extra.href}>{extra.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

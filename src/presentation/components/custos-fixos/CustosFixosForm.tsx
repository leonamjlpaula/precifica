'use client';

import { useState, useMemo, useTransition } from 'react';
import { saveCustoFixoConfig } from '@/application/usecases/custoFixoActions';
import { useToast } from '@/presentation/hooks/use-toast';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/card';
import { TermTooltip } from '@/presentation/components/ui/TermTooltip';
import type { CustoFixoConfig, CustoFixoItem } from '@prisma/client';

type ConfigState = {
  diasUteis: number;
  horasTrabalho: number;
  investimentoEquipamentos: number;
  anosDepreciacao: number;
  salarioBase: number;
  percFundoReserva: number;
  percInsalubridade: number;
  percImprevistos: number;
  taxaRetornoPerc: number;
  anosRetorno: number;
  numeroCadeiras: number;
  percOciosidade: number;
  percImpostos: number;
  percTaxaCartao: number;
};

type ItemState = {
  id?: string;
  nome: string;
  valor: number;
  ordem: number;
  isCustom: boolean;
};

function calcCustoFixoPorMinuto(config: ConfigState, items: ItemState[]): number {
  const minutosUteis =
    config.diasUteis * config.horasTrabalho * 60 * (1 - config.percOciosidade / 100);
  if (minutosUteis <= 0) return 0;
  const cadeiras = Math.max(1, config.numeroCadeiras);
  const totalItens = items.reduce((sum, item) => sum + item.valor, 0);
  const custoFixoBase = totalItens / (minutosUteis * cadeiras);
  const minutosAnuais = minutosUteis * 11;
  const depreciacao = config.investimentoEquipamentos / (config.anosDepreciacao * minutosAnuais);
  const remuneracaoMensal =
    config.salarioBase *
    (1 +
      config.percFundoReserva / 100 +
      config.percInsalubridade / 100 +
      config.percImprevistos / 100);
  const remuneracao = remuneracaoMensal / minutosUteis;
  const taxaRetorno =
    (config.investimentoEquipamentos * (config.taxaRetornoPerc / 100)) /
    (config.anosRetorno * minutosAnuais);
  return custoFixoBase + depreciacao + remuneracao + taxaRetorno;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

interface Props {
  userId: string;
  initialConfig: CustoFixoConfig;
  initialItems: CustoFixoItem[];
}

export function CustosFixosForm({ userId, initialConfig, initialItems }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [config, setConfig] = useState<ConfigState>({
    diasUteis: initialConfig.diasUteis,
    horasTrabalho: initialConfig.horasTrabalho,
    investimentoEquipamentos: initialConfig.investimentoEquipamentos,
    anosDepreciacao: initialConfig.anosDepreciacao,
    salarioBase: initialConfig.salarioBase,
    percFundoReserva: initialConfig.percFundoReserva,
    percInsalubridade: initialConfig.percInsalubridade,
    percImprevistos: initialConfig.percImprevistos,
    taxaRetornoPerc: initialConfig.taxaRetornoPerc,
    anosRetorno: initialConfig.anosRetorno,
    numeroCadeiras: initialConfig.numeroCadeiras,
    percOciosidade: initialConfig.percOciosidade,
    percImpostos: initialConfig.percImpostos,
    percTaxaCartao: initialConfig.percTaxaCartao,
  });

  const [items, setItems] = useState<ItemState[]>(
    initialItems.map((item) => ({
      id: item.id,
      nome: item.nome,
      valor: item.valor,
      ordem: item.ordem,
      isCustom: item.isCustom,
    }))
  );

  const [newItemNome, setNewItemNome] = useState('');
  const [newItemValor, setNewItemValor] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const custoFixoPorMinuto = useMemo(() => calcCustoFixoPorMinuto(config, items), [config, items]);

  function updateConfig(key: keyof ConfigState, value: number) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateItemValor(index: number, valor: number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, valor } : item)));
  }

  function deleteItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    const valor = parseFloat(newItemValor.replace(',', '.'));
    if (!newItemNome.trim() || isNaN(valor) || valor < 0) return;
    const maxOrdem = Math.max(0, ...items.map((i) => i.ordem));
    setItems((prev) => [
      ...prev,
      { nome: newItemNome.trim(), valor, ordem: maxOrdem + 1, isCustom: true },
    ]);
    setNewItemNome('');
    setNewItemValor('');
    setShowAddForm(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveCustoFixoConfig(userId, {
        ...config,
        items: items.map((item, index) => ({
          id: item.id,
          nome: item.nome,
          valor: item.valor,
          ordem: item.ordem ?? index,
          isCustom: item.isCustom,
        })),
      });
      if (result.success) {
        const n = result.procedimentosNoVermelho ?? 0;
        toast({
          title: 'Configuração salva!',
          description:
            n > 0
              ? `${n} procedimento${n > 1 ? 's estão' : ' está'} abaixo de 10% de margem. Revise seus preços.`
              : 'Seus custos fixos foram atualizados.',
        });
      } else {
        toast({
          title: 'Erro ao salvar',
          description: result.errors?.general?.join(', ') ?? 'Tente novamente.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Custos Fixos</h1>
        <p className="text-muted-foreground mt-1">
          Configure os custos fixos mensais do seu consultório.
        </p>
      </div>

      {/* Banner — Custo por Minuto */}
      <Card className="bg-primary/90 text-primary-foreground sticky top-0 z-10 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-sm font-medium opacity-80">Custo Fixo por Minuto</p>
          <p className="text-4xl font-bold mt-1">{formatBRL(custoFixoPorMinuto)} / min</p>
          <p className="text-xs opacity-70 mt-2">
            Total mensal ÷ {config.diasUteis} dias × {config.horasTrabalho}h × 60min
            {config.percOciosidade > 0 &&
              ` × ${(100 - config.percOciosidade).toFixed(0)}% ocupação`}
            {config.numeroCadeiras > 1 && ` ÷ ${config.numeroCadeiras} cadeiras`} + Depreciação (11
            meses) + Remuneração + Retorno
          </p>
        </CardContent>
      </Card>

      {/* Jornada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações de Jornada</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Dias úteis / mês</Label>
            <Input
              type="number"
              value={config.diasUteis}
              onChange={(e) => updateConfig('diasUteis', parseInt(e.target.value) || 1)}
              min={1}
              max={31}
            />
          </div>
          <div className="space-y-2">
            <Label>Horas de trabalho / dia</Label>
            <Input
              type="number"
              value={config.horasTrabalho}
              onChange={(e) => updateConfig('horasTrabalho', parseInt(e.target.value) || 1)}
              min={1}
              max={24}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 1 — Custos Mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seção 1 — Custos Mensais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((item, index) => (
              <div
                key={item.id ?? `new-${index}`}
                className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
              >
                <span className="flex-1 text-sm leading-snug">{item.nome}</span>
                <div className="relative w-36 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    R$
                  </span>
                  <Input
                    type="number"
                    className="pl-8"
                    value={item.valor}
                    onChange={(e) => updateItemValor(index, parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                  />
                </div>
                {item.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(index)}
                    className="text-destructive hover:text-destructive px-2 shrink-0"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add custom item */}
          <div className="px-6 pt-4 pb-5">
            {showAddForm ? (
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Novo item customizado</p>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      placeholder="Ex: Contador"
                      value={newItemNome}
                      onChange={(e) => setNewItemNome(e.target.value)}
                    />
                  </div>
                  <div className="w-36 space-y-1">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={newItemValor}
                      onChange={(e) => setNewItemValor(e.target.value)}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addItem}>
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItemNome('');
                      setNewItemValor('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                + Adicionar item
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Depreciação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Seção 2 — <TermTooltip term="depreciacao">Depreciação</TermTooltip> de Equipamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Investimento total em equipamentos (R$)</Label>
            <Input
              type="number"
              value={config.investimentoEquipamentos}
              onChange={(e) =>
                updateConfig('investimentoEquipamentos', parseFloat(e.target.value) || 0)
              }
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-2">
            <Label>Vida útil (anos)</Label>
            <Input
              type="number"
              value={config.anosDepreciacao}
              onChange={(e) => updateConfig('anosDepreciacao', parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Remuneração Profissional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seção 3 — Remuneração Profissional</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Salário base (R$)</Label>
            <Input
              type="number"
              value={config.salarioBase}
              onChange={(e) => updateConfig('salarioBase', parseFloat(e.target.value) || 0)}
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-2">
            <Label>
              <TermTooltip term="fundoReserva">Fundo de reserva</TermTooltip> (%)
            </Label>
            <Input
              type="number"
              value={config.percFundoReserva}
              onChange={(e) => updateConfig('percFundoReserva', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <Label>
              <TermTooltip term="insalubridade">Insalubridade</TermTooltip> (%)
            </Label>
            <Input
              type="number"
              value={config.percInsalubridade}
              onChange={(e) => updateConfig('percInsalubridade', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <Label>Imprevistos (%)</Label>
            <Input
              type="number"
              value={config.percImprevistos}
              onChange={(e) => updateConfig('percImprevistos', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Taxa de Retorno */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seção 4 — Taxa de Retorno sobre Investimento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Taxa de retorno (%)</Label>
            <Input
              type="number"
              value={config.taxaRetornoPerc}
              onChange={(e) => updateConfig('taxaRetornoPerc', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <Label>Prazo de retorno (anos)</Label>
            <Input
              type="number"
              value={config.anosRetorno}
              onChange={(e) => updateConfig('anosRetorno', parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 5 — Contexto do Consultório */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seção 5 — Contexto do Consultório</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Número de cadeiras ativas</Label>
            <Input
              type="number"
              value={config.numeroCadeiras}
              onChange={(e) => updateConfig('numeroCadeiras', parseInt(e.target.value) || 1)}
              min={1}
              max={20}
            />
            <p className="text-xs text-muted-foreground">
              Divide os custos fixos entre as cadeiras. Use 1 se atende sozinho(a).
            </p>
          </div>
          <div className="space-y-2">
            <Label>
              Taxa de <TermTooltip term="ociosidade">ociosidade</TermTooltip> (%)
            </Label>
            <Input
              type="number"
              value={config.percOciosidade}
              onChange={(e) => updateConfig('percOciosidade', parseFloat(e.target.value) || 0)}
              min={0}
              max={99}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              % do tempo produtivo não utilizado. Recomendado: 20% para clínicas típicas.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Impostos sobre faturamento (%)</Label>
            <Input
              type="number"
              value={config.percImpostos}
              onChange={(e) => updateConfig('percImpostos', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              <TermTooltip term="ISS">ISS</TermTooltip> /{' '}
              <TermTooltip term="simplesNacional">Simples Nacional</TermTooltip> incidente sobre o
              preço de venda (não sobre o custo).
            </p>
          </div>
          <div className="space-y-2">
            <Label>Taxa de cartão (%)</Label>
            <Input
              type="number"
              value={config.percTaxaCartao}
              onChange={(e) => updateConfig('percTaxaCartao', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Taxa média cobrada pela operadora de cartão. Usado no cálculo de margem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </div>
    </div>
  );
}

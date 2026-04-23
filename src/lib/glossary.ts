export type TermKey =
  | 'VRPO'
  | 'CNCC'
  | 'ociosidade'
  | 'proLabore'
  | 'insalubridade'
  | 'fundoReserva'
  | 'breakEven'
  | 'ISS'
  | 'simplesNacional'
  | 'depreciacao';

export interface GlossaryEntry {
  short: string;
  friendly: string;
  tooltip: string;
}

export const GLOSSARY: Record<TermKey, GlossaryEntry> = {
  VRPO: {
    short: 'VRPO',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): Valor Referencial de Procedimento Odontológico',
  },
  CNCC: {
    short: 'CNCC',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): Comissão Nacional de Convênios e Credenciamentos',
  },
  ociosidade: {
    short: 'ociosidade',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): % do tempo que a cadeira fica vazia',
  },
  proLabore: {
    short: 'pró-labore',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): remuneração do dentista proprietário',
  },
  insalubridade: {
    short: 'insalubridade',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): adicional de 40% por exposição a risco',
  },
  fundoReserva: {
    short: 'fundo de reserva',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): 11% reservado para 13º/férias/rescisão',
  },
  breakEven: {
    short: 'break-even',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): preço mínimo que cobre todos os custos',
  },
  ISS: {
    short: 'ISS',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): Imposto Sobre Serviços municipal',
  },
  simplesNacional: {
    short: 'Simples Nacional',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): regime tributário simplificado',
  },
  depreciacao: {
    short: 'depreciação',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): desgaste contábil do equipamento ao longo do tempo',
  },
};

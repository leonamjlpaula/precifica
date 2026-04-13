import { prisma } from './db'

// ─── Default cost items (14 standard VRPO items) ─────────────────────────────

export const DEFAULT_CUSTO_FIXO_ITEMS = [
  { nome: 'Aluguel e/ou Taxa de Ocupação', valor: 2500, ordem: 1 },
  { nome: 'Água e Esgoto', valor: 150, ordem: 2 },
  { nome: 'Energia Elétrica', valor: 400, ordem: 3 },
  { nome: 'Telefone e Internet', valor: 250, ordem: 4 },
  { nome: 'Gás', valor: 50, ordem: 5 },
  { nome: 'Material de Limpeza', valor: 200, ordem: 6 },
  { nome: 'Material de Escritório', valor: 150, ordem: 7 },
  { nome: 'Serviços Contábeis', valor: 500, ordem: 8 },
  { nome: 'Publicidade e Marketing', valor: 300, ordem: 9 },
  { nome: 'Plano de Saúde', valor: 800, ordem: 10 },
  { nome: 'IPTU e Taxas', valor: 200, ordem: 11 },
  { nome: 'Manutenção de Equipamentos', valor: 350, ordem: 12 },
  { nome: 'Seguros', valor: 150, ordem: 13 },
  { nome: 'Outros', valor: 500, ordem: 14 },
] as const

// ─── Default materials (30 representative dental materials) ──────────────────

export const DEFAULT_MATERIAIS = [
  { nome: 'Resina Composta A1', unidade: 'seringa 4g', preco: 85.0 },
  { nome: 'Resina Composta A2', unidade: 'seringa 4g', preco: 85.0 },
  { nome: 'Resina Composta A3', unidade: 'seringa 4g', preco: 85.0 },
  { nome: 'Resina Composta A3.5', unidade: 'seringa 4g', preco: 85.0 },
  { nome: 'Amálgama', unidade: 'pote 50 cápsulas', preco: 120.0 },
  { nome: 'Cimento de Ionômero de Vidro', unidade: 'frasco 15g', preco: 65.0 },
  { nome: 'Cimento de Fosfato de Zinco', unidade: 'kit pó/líquido', preco: 45.0 },
  { nome: 'Anestésico Dental (Mepivacaína 2%)', unidade: 'caixa 50 tubetes', preco: 95.0 },
  { nome: 'Agulha Gengival Curta', unidade: 'caixa 100 un', preco: 35.0 },
  { nome: 'Agulha Gengival Longa', unidade: 'caixa 100 un', preco: 38.0 },
  { nome: 'Guta-Percha (cones)', unidade: 'caixa 60 cones', preco: 30.0 },
  { nome: 'Cimento Endodôntico (AH Plus)', unidade: 'kit', preco: 140.0 },
  { nome: 'Hipoclorito de Sódio 2,5%', unidade: 'frasco 1 litro', preco: 15.0 },
  { nome: 'Lâmina de Bisturi nº 15', unidade: 'caixa 100 un', preco: 45.0 },
  { nome: 'Fio de Sutura 3-0', unidade: 'caixa 12 un', preco: 55.0 },
  { nome: 'Fio de Sutura 4-0', unidade: 'caixa 12 un', preco: 58.0 },
  { nome: 'Alginato', unidade: 'pote 500g', preco: 35.0 },
  { nome: 'Gesso Pedra Tipo III', unidade: 'saco 1kg', preco: 12.0 },
  { nome: 'Película Radiográfica Periapical', unidade: 'pacote 150 un', preco: 85.0 },
  { nome: 'Luvas de Procedimento M', unidade: 'caixa 100 un', preco: 28.0 },
  { nome: 'Máscara Cirúrgica Tripla', unidade: 'caixa 50 un', preco: 18.0 },
  { nome: 'Barreira de Proteção Universal', unidade: 'rolo 150m', preco: 42.0 },
  { nome: 'Sugador Descartável', unidade: 'pacote 40 un', preco: 12.0 },
  { nome: 'Hidróxido de Cálcio', unidade: 'seringa 2,5g', preco: 25.0 },
  { nome: 'Clorexidina 0,12%', unidade: 'frasco 250ml', preco: 18.0 },
  { nome: 'Ácido Fosfórico 37%', unidade: 'bisnaga 5g', preco: 8.0 },
  { nome: 'Adesivo Universal', unidade: 'frasco 5ml', preco: 95.0 },
  { nome: 'Isolante Absoluto (dique de borracha)', unidade: 'pacote 36 folhas', preco: 45.0 },
  { nome: 'Microbrush Aplicador', unidade: 'pacote 100 un', preco: 15.0 },
  { nome: 'Verniz Fluorado', unidade: 'frasco 10ml', preco: 65.0 },
] as const

// ─── Procedure type ───────────────────────────────────────────────────────────

type ProcedimentoData = {
  codigo: string
  nome: string
  especialidadeCodigo: string
  tempoMinutos: number
  materiais: Array<{
    materialNome: string
    consumo: string
    divisor: number
    ordem: number
  }>
}

// ─── Default procedures (representative set for each specialty) ───────────────

export const DEFAULT_PROCEDIMENTOS: ProcedimentoData[] = [
  // Diagnóstico
  {
    codigo: '100',
    nome: 'Consulta / Exame Clínico',
    especialidadeCodigo: 'diagnostico',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
      { materialNome: 'Máscara Cirúrgica Tripla', consumo: '1 un', divisor: 50, ordem: 2 },
    ],
  },
  {
    codigo: '110',
    nome: 'Plano de Tratamento',
    especialidadeCodigo: 'diagnostico',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
    ],
  },
  // Radiologia
  {
    codigo: '200',
    nome: 'Radiografia Periapical',
    especialidadeCodigo: 'radiologia',
    tempoMinutos: 15,
    materiais: [
      { materialNome: 'Película Radiográfica Periapical', consumo: '1 película', divisor: 150, ordem: 1 },
      { materialNome: 'Barreira de Proteção Universal', consumo: 'cobertura', divisor: 150, ordem: 2 },
    ],
  },
  {
    codigo: '210',
    nome: 'Radiografia Interproximal (Bite-wing)',
    especialidadeCodigo: 'radiologia',
    tempoMinutos: 15,
    materiais: [
      { materialNome: 'Película Radiográfica Periapical', consumo: '1 película', divisor: 150, ordem: 1 },
    ],
  },
  {
    codigo: '220',
    nome: 'Radiografia Oclusal',
    especialidadeCodigo: 'radiologia',
    tempoMinutos: 20,
    materiais: [
      { materialNome: 'Película Radiográfica Periapical', consumo: '1 película', divisor: 150, ordem: 1 },
    ],
  },
  // Testes e Exames
  {
    codigo: '400',
    nome: 'Teste de Vitalidade Pulpar',
    especialidadeCodigo: 'testes-exames',
    tempoMinutos: 20,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
    ],
  },
  {
    codigo: '410',
    nome: 'Teste de Sensibilidade Dentinária',
    especialidadeCodigo: 'testes-exames',
    tempoMinutos: 20,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
    ],
  },
  // Prevenção
  {
    codigo: '500',
    nome: 'Profilaxia Dental',
    especialidadeCodigo: 'prevencao',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
      { materialNome: 'Sugador Descartável', consumo: '1 un', divisor: 40, ordem: 2 },
    ],
  },
  {
    codigo: '510',
    nome: 'Raspagem Supra/Subgengival por Sextante',
    especialidadeCodigo: 'prevencao',
    tempoMinutos: 45,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
      { materialNome: 'Clorexidina 0,12%', consumo: '5ml', divisor: 50, ordem: 2 },
    ],
  },
  {
    codigo: '520',
    nome: 'Aplicação Tópica de Flúor',
    especialidadeCodigo: 'prevencao',
    tempoMinutos: 20,
    materiais: [
      { materialNome: 'Verniz Fluorado', consumo: '0,5ml', divisor: 20, ordem: 1 },
    ],
  },
  {
    codigo: '530',
    nome: 'Selante (por dente)',
    especialidadeCodigo: 'prevencao',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 1 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 2 },
      { materialNome: 'Resina Composta A2', consumo: '0,1g', divisor: 40, ordem: 3 },
    ],
  },
  // Odontopediatria
  {
    codigo: '600',
    nome: 'Atendimento Odontopediátrico',
    especialidadeCodigo: 'odontopediatria',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
    ],
  },
  {
    codigo: '610',
    nome: 'Restauração em Dente Decíduo',
    especialidadeCodigo: 'odontopediatria',
    tempoMinutos: 45,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 3 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 4 },
      { materialNome: 'Resina Composta A2', consumo: '1g', divisor: 4, ordem: 5 },
    ],
  },
  {
    codigo: '620',
    nome: 'Pulpotomia em Dente Decíduo',
    especialidadeCodigo: 'odontopediatria',
    tempoMinutos: 60,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Hidróxido de Cálcio', consumo: '0,5g', divisor: 5, ordem: 3 },
      { materialNome: 'Cimento de Ionômero de Vidro', consumo: '1g', divisor: 15, ordem: 4 },
    ],
  },
  {
    codigo: '640',
    nome: 'Exodontia de Dente Decíduo',
    especialidadeCodigo: 'odontopediatria',
    tempoMinutos: 20,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
    ],
  },
  // Dentística
  {
    codigo: '900',
    nome: 'Restauração de Resina Composta – 1 Face',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 45,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 3 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 4 },
      { materialNome: 'Resina Composta A2', consumo: '1g', divisor: 4, ordem: 5 },
      { materialNome: 'Microbrush Aplicador', consumo: '2 un', divisor: 50, ordem: 6 },
    ],
  },
  {
    codigo: '910',
    nome: 'Restauração de Resina Composta – 2 Faces',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 60,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 3 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 4 },
      { materialNome: 'Resina Composta A2', consumo: '2g', divisor: 4, ordem: 5 },
      { materialNome: 'Microbrush Aplicador', consumo: '2 un', divisor: 50, ordem: 6 },
    ],
  },
  {
    codigo: '920',
    nome: 'Restauração de Resina Composta – 3 Faces',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 75,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 3 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 4 },
      { materialNome: 'Resina Composta A2', consumo: '3g', divisor: 4, ordem: 5 },
      { materialNome: 'Microbrush Aplicador', consumo: '2 un', divisor: 50, ordem: 6 },
    ],
  },
  {
    codigo: '930',
    nome: 'Restauração de Resina Composta – 4 Faces ou mais',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 90,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 3 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 4 },
      { materialNome: 'Resina Composta A2', consumo: '4g', divisor: 4, ordem: 5 },
      { materialNome: 'Microbrush Aplicador', consumo: '3 un', divisor: 50, ordem: 6 },
    ],
  },
  {
    codigo: '940',
    nome: 'Restauração de Amálgama – 1 Face',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 40,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Amálgama', consumo: '1 cápsula', divisor: 50, ordem: 3 },
    ],
  },
  {
    codigo: '950',
    nome: 'Restauração de Amálgama – 2 Faces',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 50,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '1 tubete', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Amálgama', consumo: '2 cápsulas', divisor: 50, ordem: 3 },
    ],
  },
  {
    codigo: '970',
    nome: 'Clareamento Dental Caseiro (arco)',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Alginato', consumo: '50g moldagem', divisor: 10, ordem: 1 },
      { materialNome: 'Gesso Pedra Tipo III', consumo: '200g', divisor: 5, ordem: 2 },
    ],
  },
  {
    codigo: '1000',
    nome: 'Faceta de Resina Composta Direta',
    especialidadeCodigo: 'dentistica',
    tempoMinutos: 90,
    materiais: [
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 1 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 2 },
      { materialNome: 'Resina Composta A1', consumo: '4g', divisor: 4, ordem: 3 },
      { materialNome: 'Microbrush Aplicador', consumo: '3 un', divisor: 50, ordem: 4 },
    ],
  },
  // Endodontia
  {
    codigo: '2000',
    nome: 'Tratamento Endodôntico – Incisivo / Canino (1 canal)',
    especialidadeCodigo: 'endodontia',
    tempoMinutos: 90,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Hipoclorito de Sódio 2,5%', consumo: '20ml', divisor: 50, ordem: 3 },
      { materialNome: 'Guta-Percha (cones)', consumo: '5 cones', divisor: 60, ordem: 4 },
      { materialNome: 'Cimento Endodôntico (AH Plus)', consumo: 'kit por caso', divisor: 10, ordem: 5 },
      { materialNome: 'Isolante Absoluto (dique de borracha)', consumo: '1 folha', divisor: 36, ordem: 6 },
    ],
  },
  {
    codigo: '2010',
    nome: 'Tratamento Endodôntico – Pré-molar (2 canais)',
    especialidadeCodigo: 'endodontia',
    tempoMinutos: 120,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Hipoclorito de Sódio 2,5%', consumo: '30ml', divisor: 50, ordem: 3 },
      { materialNome: 'Guta-Percha (cones)', consumo: '10 cones', divisor: 60, ordem: 4 },
      { materialNome: 'Cimento Endodôntico (AH Plus)', consumo: 'kit por caso', divisor: 10, ordem: 5 },
      { materialNome: 'Isolante Absoluto (dique de borracha)', consumo: '1 folha', divisor: 36, ordem: 6 },
    ],
  },
  {
    codigo: '2020',
    nome: 'Tratamento Endodôntico – Molar (3 canais)',
    especialidadeCodigo: 'endodontia',
    tempoMinutos: 150,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '3 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Hipoclorito de Sódio 2,5%', consumo: '40ml', divisor: 50, ordem: 3 },
      { materialNome: 'Guta-Percha (cones)', consumo: '15 cones', divisor: 60, ordem: 4 },
      { materialNome: 'Cimento Endodôntico (AH Plus)', consumo: 'kit por caso', divisor: 10, ordem: 5 },
      { materialNome: 'Isolante Absoluto (dique de borracha)', consumo: '1 folha', divisor: 36, ordem: 6 },
    ],
  },
  {
    codigo: '2030',
    nome: 'Tratamento Endodôntico – Molar (4 canais)',
    especialidadeCodigo: 'endodontia',
    tempoMinutos: 180,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '3 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Hipoclorito de Sódio 2,5%', consumo: '50ml', divisor: 50, ordem: 3 },
      { materialNome: 'Guta-Percha (cones)', consumo: '20 cones', divisor: 60, ordem: 4 },
      { materialNome: 'Cimento Endodôntico (AH Plus)', consumo: 'kit por caso', divisor: 10, ordem: 5 },
      { materialNome: 'Isolante Absoluto (dique de borracha)', consumo: '1 folha', divisor: 36, ordem: 6 },
    ],
  },
  // Periodontia
  {
    codigo: '3000',
    nome: 'Raspagem e Alisamento Radicular por Sextante',
    especialidadeCodigo: 'periodontia',
    tempoMinutos: 60,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Clorexidina 0,12%', consumo: '10ml', divisor: 25, ordem: 3 },
    ],
  },
  {
    codigo: '3020',
    nome: 'Cirurgia Periodontal por Sextante',
    especialidadeCodigo: 'periodontia',
    tempoMinutos: 90,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '3 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '1 lâmina', divisor: 100, ordem: 3 },
      { materialNome: 'Fio de Sutura 4-0', consumo: '1 un', divisor: 12, ordem: 4 },
      { materialNome: 'Clorexidina 0,12%', consumo: '15ml', divisor: 25, ordem: 5 },
    ],
  },
  {
    codigo: '3030',
    nome: 'Gengivectomia',
    especialidadeCodigo: 'periodontia',
    tempoMinutos: 60,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '1 lâmina', divisor: 100, ordem: 3 },
    ],
  },
  // Prótese
  {
    codigo: '4000',
    nome: 'Coroa de Porcelana sobre Metal',
    especialidadeCodigo: 'protese',
    tempoMinutos: 120,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Alginato', consumo: '100g', divisor: 5, ordem: 3 },
      { materialNome: 'Gesso Pedra Tipo III', consumo: '300g', divisor: 3, ordem: 4 },
    ],
  },
  {
    codigo: '4010',
    nome: 'Coroa Full Porcelana (Zircônia / E-Max)',
    especialidadeCodigo: 'protese',
    tempoMinutos: 120,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Curta', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Alginato', consumo: '100g', divisor: 5, ordem: 3 },
      { materialNome: 'Gesso Pedra Tipo III', consumo: '300g', divisor: 3, ordem: 4 },
    ],
  },
  {
    codigo: '4040',
    nome: 'Prótese Total Superior',
    especialidadeCodigo: 'protese',
    tempoMinutos: 180,
    materiais: [
      { materialNome: 'Alginato', consumo: '200g', divisor: 2, ordem: 1 },
      { materialNome: 'Gesso Pedra Tipo III', consumo: '500g', divisor: 2, ordem: 2 },
    ],
  },
  {
    codigo: '4050',
    nome: 'Prótese Total Inferior',
    especialidadeCodigo: 'protese',
    tempoMinutos: 180,
    materiais: [
      { materialNome: 'Alginato', consumo: '200g', divisor: 2, ordem: 1 },
      { materialNome: 'Gesso Pedra Tipo III', consumo: '500g', divisor: 2, ordem: 2 },
    ],
  },
  // Cirurgia
  {
    codigo: '5000',
    nome: 'Exodontia Simples',
    especialidadeCodigo: 'cirurgia',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
    ],
  },
  {
    codigo: '5010',
    nome: 'Exodontia com Retalho (por elemento)',
    especialidadeCodigo: 'cirurgia',
    tempoMinutos: 60,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '3 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '1 lâmina', divisor: 100, ordem: 3 },
      { materialNome: 'Fio de Sutura 3-0', consumo: '1 un', divisor: 12, ordem: 4 },
    ],
  },
  {
    codigo: '5020',
    nome: 'Exodontia de Dente Incluso',
    especialidadeCodigo: 'cirurgia',
    tempoMinutos: 90,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '4 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '2 lâminas', divisor: 100, ordem: 3 },
      { materialNome: 'Fio de Sutura 3-0', consumo: '2 un', divisor: 12, ordem: 4 },
    ],
  },
  {
    codigo: '5030',
    nome: 'Exodontia de Dente Impactado (siso incluso)',
    especialidadeCodigo: 'cirurgia',
    tempoMinutos: 120,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '4 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '2 lâminas', divisor: 100, ordem: 3 },
      { materialNome: 'Fio de Sutura 3-0', consumo: '3 un', divisor: 12, ordem: 4 },
    ],
  },
  {
    codigo: '5040',
    nome: 'Frenectomia',
    especialidadeCodigo: 'cirurgia',
    tempoMinutos: 45,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '1 lâmina', divisor: 100, ordem: 3 },
      { materialNome: 'Fio de Sutura 4-0', consumo: '1 un', divisor: 12, ordem: 4 },
    ],
  },
  {
    codigo: '5070',
    nome: 'Drenagem de Abscesso',
    especialidadeCodigo: 'cirurgia',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Anestésico Dental (Mepivacaína 2%)', consumo: '2 tubetes', divisor: 50, ordem: 1 },
      { materialNome: 'Agulha Gengival Longa', consumo: '1 un', divisor: 100, ordem: 2 },
      { materialNome: 'Lâmina de Bisturi nº 15', consumo: '1 lâmina', divisor: 100, ordem: 3 },
    ],
  },
  // Ortodontia
  {
    codigo: '6000',
    nome: 'Instalação de Aparelho Ortodôntico Fixo',
    especialidadeCodigo: 'ortodontia',
    tempoMinutos: 90,
    materiais: [
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 bisnaga', divisor: 1, ordem: 1 },
      { materialNome: 'Microbrush Aplicador', consumo: '10 un', divisor: 50, ordem: 2 },
    ],
  },
  {
    codigo: '6010',
    nome: 'Manutenção Mensal de Aparelho Ortodôntico',
    especialidadeCodigo: 'ortodontia',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Luvas de Procedimento M', consumo: '1 par', divisor: 100, ordem: 1 },
    ],
  },
  {
    codigo: '6040',
    nome: 'Contenção Ortodôntica',
    especialidadeCodigo: 'ortodontia',
    tempoMinutos: 30,
    materiais: [
      { materialNome: 'Ácido Fosfórico 37%', consumo: '1 aplicação', divisor: 5, ordem: 1 },
      { materialNome: 'Adesivo Universal', consumo: '1 gota', divisor: 100, ordem: 2 },
    ],
  },
]

// ─── Create default data for a new user ──────────────────────────────────────

export async function createDefaultDataForUser(userId: string): Promise<void> {
  // 1. Create CustoFixoConfig with default values
  const config = await prisma.custoFixoConfig.create({
    data: {
      userId,
      diasUteis: 22,
      horasTrabalho: 8,
      investimentoEquipamentos: 61009,
      anosDepreciacao: 10,
      salarioBase: 6000,
      percFundoReserva: 11,
      percInsalubridade: 40,
      percImprevistos: 20,
      taxaRetornoPerc: 3,
      anosRetorno: 3,
      items: {
        create: DEFAULT_CUSTO_FIXO_ITEMS.map((item) => ({
          nome: item.nome,
          valor: item.valor,
          ordem: item.ordem,
          isCustom: false,
        })),
      },
    },
  })

  if (!config) throw new Error('Failed to create CustoFixoConfig')

  // 2. Create default materials (isDefault: true) — single query to avoid connection pool exhaustion
  const createdMateriais = await prisma.material.createManyAndReturn({
    data: DEFAULT_MATERIAIS.map((mat) => ({
      userId,
      nome: mat.nome,
      unidade: mat.unidade,
      preco: mat.preco,
      isDefault: true,
    })),
  })

  // Build a name → id lookup for materials
  const materialByNome = new Map(createdMateriais.map((m) => [m.nome, m.id]))

  // 3. Fetch all specialties from the DB (seeded globally)
  const especialidades = await prisma.especialidade.findMany()
  const especialidadeByCodigo = new Map(especialidades.map((e) => [e.codigo, e.id]))

  // 4. Create all procedures in a single query
  const createdProcedimentos = await prisma.procedimento.createManyAndReturn({
    data: DEFAULT_PROCEDIMENTOS
      .filter((proc) => especialidadeByCodigo.has(proc.especialidadeCodigo))
      .map((proc) => ({
        userId,
        codigo: proc.codigo,
        nome: proc.nome,
        especialidadeId: especialidadeByCodigo.get(proc.especialidadeCodigo)!,
        tempoMinutos: proc.tempoMinutos,
        isCustom: false,
      })),
  })

  // 5. Create all procedure-material links in a single query
  const procedimentoByCodigo = new Map(createdProcedimentos.map((p) => [p.codigo, p.id]))

  const procedimentoMateriais = DEFAULT_PROCEDIMENTOS.flatMap((proc) => {
    const procedimentoId = procedimentoByCodigo.get(proc.codigo)
    if (!procedimentoId) return []
    return proc.materiais
      .filter((m) => materialByNome.has(m.materialNome))
      .map((m) => ({
        procedimentoId,
        materialId: materialByNome.get(m.materialNome)!,
        consumo: m.consumo,
        divisor: m.divisor,
        ordem: m.ordem,
      }))
  })

  if (procedimentoMateriais.length > 0) {
    await prisma.procedimentoMaterial.createMany({ data: procedimentoMateriais })
  }
}

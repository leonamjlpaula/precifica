import * as XLSX from 'xlsx'

export type ProcedimentoExportExcel = {
  codigo: string
  nome: string
  especialidade: string
  tempoMinutos: number
  custoVariavel: number
  precoFinal: number
  vrpoReferencia: number | null
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatPercent = (value: number | null) =>
  value !== null ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` : '-'

export class ExcelExportService {
  generate(
    procedimentos: ProcedimentoExportExcel[],
    userName: string,
    generatedAt: string
  ): Buffer {
    const headers = [
      'Código',
      'Procedimento',
      'Especialidade',
      'Tempo (min)',
      'Custo Variável',
      'Preço Calculado',
      'VRPO Ref.',
      'Diferença %',
    ]

    const rows = procedimentos.map((p) => {
      const diferencaPerc =
        p.vrpoReferencia !== null
          ? ((p.precoFinal - p.vrpoReferencia) / p.vrpoReferencia) * 100
          : null

      return [
        p.codigo,
        p.nome,
        p.especialidade,
        p.tempoMinutos,
        formatCurrency(p.custoVariavel),
        formatCurrency(p.precoFinal),
        p.vrpoReferencia !== null ? formatCurrency(p.vrpoReferencia) : '-',
        formatPercent(diferencaPerc),
      ]
    })

    const worksheetData = [headers, ...rows]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Make header row bold
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1')
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col })
      if (worksheet[cellAddr]) {
        worksheet[cellAddr].s = { font: { bold: true } }
      }
    }

    // Set column widths (wch = width in characters)
    const colWidths = worksheetData.reduce<number[]>((acc, row) => {
      row.forEach((cell, i) => {
        const cellStr = cell !== null && cell !== undefined ? String(cell) : ''
        acc[i] = Math.max(acc[i] ?? 0, cellStr.length)
      })
      return acc
    }, [])

    worksheet['!cols'] = colWidths.map((w) => ({ wch: Math.max(w + 2, 10) }))

    const workbook = XLSX.utils.book_new()

    // Add metadata sheet comment
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Precificação')

    // Add a metadata row in a separate Info sheet
    const infoData = [
      ['Gerado por', 'Precifica'],
      ['Dentista', userName],
      ['Data de Geração', generatedAt],
    ]
    const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
    infoSheet['!cols'] = [{ wch: 18 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informações')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
    return buffer
  }
}

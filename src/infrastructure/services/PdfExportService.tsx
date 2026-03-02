import React from 'react'
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

export type ProcedimentoExport = {
  codigo: string
  nome: string
  tempoMinutos: number
  custoVariavel: number
  precoFinal: number
  vrpoReferencia: number | null
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: 'Helvetica' },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subtitle: { fontSize: 11, marginBottom: 2 },
  date: { fontSize: 9, color: '#666666', marginBottom: 16 },
  table: { width: '100%' },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    backgroundColor: '#f3f4f6',
  },
  colCodigo: { width: '10%' },
  colNome: { width: '35%', paddingRight: 4 },
  colTempo: { width: '10%', textAlign: 'right' },
  colCustoVar: { width: '15%', textAlign: 'right' },
  colPreco: { width: '15%', textAlign: 'right' },
  colVrpo: { width: '15%', textAlign: 'right' },
  headerText: { fontFamily: 'Helvetica-Bold' },
  empty: { textAlign: 'center', paddingTop: 16, color: '#6b7280' },
})

type DocProps = {
  procedimentos: ProcedimentoExport[]
  userName: string
  generatedAt: string
}

const PrecificaDocument = ({ procedimentos, userName, generatedAt }: DocProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Precifica</Text>
        <Text style={styles.subtitle}>{userName}</Text>
        <Text style={styles.date}>Gerado em {generatedAt}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.colCodigo, styles.headerText]}>Código</Text>
          <Text style={[styles.colNome, styles.headerText]}>Procedimento</Text>
          <Text style={[styles.colTempo, styles.headerText]}>Tempo (min)</Text>
          <Text style={[styles.colCustoVar, styles.headerText]}>Custo Variável</Text>
          <Text style={[styles.colPreco, styles.headerText]}>Preço Calculado</Text>
          <Text style={[styles.colVrpo, styles.headerText]}>VRPO Ref.</Text>
        </View>
        {procedimentos.length === 0 ? (
          <Text style={styles.empty}>Nenhum procedimento encontrado com os filtros aplicados.</Text>
        ) : (
          procedimentos.map((p) => (
            <View key={p.codigo} style={styles.row}>
              <Text style={styles.colCodigo}>{p.codigo}</Text>
              <Text style={styles.colNome}>{p.nome}</Text>
              <Text style={styles.colTempo}>{p.tempoMinutos}</Text>
              <Text style={styles.colCustoVar}>{formatCurrency(p.custoVariavel)}</Text>
              <Text style={styles.colPreco}>{formatCurrency(p.precoFinal)}</Text>
              <Text style={styles.colVrpo}>
                {p.vrpoReferencia ? formatCurrency(p.vrpoReferencia) : '-'}
              </Text>
            </View>
          ))
        )}
      </View>
    </Page>
  </Document>
)

export class PdfExportService {
  async generate(
    procedimentos: ProcedimentoExport[],
    userName: string,
    generatedAt: string
  ): Promise<Buffer> {
    return renderToBuffer(
      <PrecificaDocument
        procedimentos={procedimentos}
        userName={userName}
        generatedAt={generatedAt}
      />
    )
  }
}

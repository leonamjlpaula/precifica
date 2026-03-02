import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Especialidades (11) ──────────────────────────────────────────────────────

const ESPECIALIDADES = [
  { codigo: 'diagnostico', nome: 'Diagnóstico', faixaInicio: 100, faixaFim: 190 },
  { codigo: 'radiologia', nome: 'Radiologia', faixaInicio: 200, faixaFim: 390 },
  { codigo: 'testes-exames', nome: 'Testes e Exames', faixaInicio: 400, faixaFim: 490 },
  { codigo: 'prevencao', nome: 'Prevenção', faixaInicio: 500, faixaFim: 590 },
  { codigo: 'odontopediatria', nome: 'Odontopediatria', faixaInicio: 600, faixaFim: 890 },
  { codigo: 'dentistica', nome: 'Dentística', faixaInicio: 900, faixaFim: 1990 },
  { codigo: 'endodontia', nome: 'Endodontia', faixaInicio: 2000, faixaFim: 2990 },
  { codigo: 'periodontia', nome: 'Periodontia', faixaInicio: 3000, faixaFim: 3990 },
  { codigo: 'protese', nome: 'Prótese', faixaInicio: 4000, faixaFim: 4990 },
  { codigo: 'cirurgia', nome: 'Cirurgia', faixaInicio: 5000, faixaFim: 5990 },
  { codigo: 'ortodontia', nome: 'Ortodontia', faixaInicio: 6000, faixaFim: 6990 },
]

// ─── VRPO Reference values (65+ procedures) ───────────────────────────────────
// Values based on VRPO (Valores Referenciais para Procedimentos Odontológicos)
// Reference table — adjust to the latest CFO publication when available.

const VRPO_REFERENCIAS = [
  // Diagnóstico (100–190)
  { codigo: '100', valorReferencia: 150.0 },
  { codigo: '110', valorReferencia: 120.0 },
  { codigo: '120', valorReferencia: 180.0 },
  // Radiologia (200–390)
  { codigo: '200', valorReferencia: 35.0 },
  { codigo: '210', valorReferencia: 45.0 },
  { codigo: '220', valorReferencia: 85.0 },
  { codigo: '230', valorReferencia: 280.0 },
  { codigo: '240', valorReferencia: 350.0 },
  // Testes e Exames (400–490)
  { codigo: '400', valorReferencia: 85.0 },
  { codigo: '410', valorReferencia: 120.0 },
  { codigo: '420', valorReferencia: 95.0 },
  // Prevenção (500–590)
  { codigo: '500', valorReferencia: 95.0 },
  { codigo: '510', valorReferencia: 120.0 },
  { codigo: '520', valorReferencia: 65.0 },
  { codigo: '530', valorReferencia: 95.0 },
  { codigo: '540', valorReferencia: 150.0 },
  { codigo: '550', valorReferencia: 85.0 },
  // Odontopediatria (600–890)
  { codigo: '600', valorReferencia: 120.0 },
  { codigo: '610', valorReferencia: 85.0 },
  { codigo: '620', valorReferencia: 150.0 },
  { codigo: '630', valorReferencia: 180.0 },
  { codigo: '640', valorReferencia: 95.0 },
  { codigo: '650', valorReferencia: 110.0 },
  { codigo: '660', valorReferencia: 130.0 },
  // Dentística (900–1990)
  { codigo: '900', valorReferencia: 185.0 },
  { codigo: '910', valorReferencia: 240.0 },
  { codigo: '920', valorReferencia: 290.0 },
  { codigo: '930', valorReferencia: 340.0 },
  { codigo: '940', valorReferencia: 155.0 },
  { codigo: '950', valorReferencia: 200.0 },
  { codigo: '960', valorReferencia: 245.0 },
  { codigo: '970', valorReferencia: 450.0 },
  { codigo: '980', valorReferencia: 650.0 },
  { codigo: '990', valorReferencia: 120.0 },
  { codigo: '1000', valorReferencia: 850.0 },
  { codigo: '1010', valorReferencia: 1200.0 },
  { codigo: '1020', valorReferencia: 320.0 },
  // Endodontia (2000–2990)
  { codigo: '2000', valorReferencia: 380.0 },
  { codigo: '2010', valorReferencia: 450.0 },
  { codigo: '2020', valorReferencia: 550.0 },
  { codigo: '2030', valorReferencia: 680.0 },
  { codigo: '2040', valorReferencia: 480.0 },
  { codigo: '2050', valorReferencia: 550.0 },
  { codigo: '2060', valorReferencia: 350.0 },
  // Periodontia (3000–3990)
  { codigo: '3000', valorReferencia: 280.0 },
  { codigo: '3010', valorReferencia: 1680.0 },
  { codigo: '3020', valorReferencia: 450.0 },
  { codigo: '3030', valorReferencia: 350.0 },
  { codigo: '3040', valorReferencia: 650.0 },
  { codigo: '3050', valorReferencia: 750.0 },
  { codigo: '3060', valorReferencia: 420.0 },
  // Prótese (4000–4990)
  { codigo: '4000', valorReferencia: 950.0 },
  { codigo: '4010', valorReferencia: 1200.0 },
  { codigo: '4020', valorReferencia: 650.0 },
  { codigo: '4030', valorReferencia: 2800.0 },
  { codigo: '4040', valorReferencia: 980.0 },
  { codigo: '4050', valorReferencia: 980.0 },
  { codigo: '4060', valorReferencia: 1800.0 },
  { codigo: '4070', valorReferencia: 1500.0 },
  { codigo: '4080', valorReferencia: 850.0 },
  { codigo: '4090', valorReferencia: 1100.0 },
  // Cirurgia (5000–5990)
  { codigo: '5000', valorReferencia: 280.0 },
  { codigo: '5010', valorReferencia: 450.0 },
  { codigo: '5020', valorReferencia: 680.0 },
  { codigo: '5030', valorReferencia: 850.0 },
  { codigo: '5040', valorReferencia: 380.0 },
  { codigo: '5050', valorReferencia: 450.0 },
  { codigo: '5060', valorReferencia: 550.0 },
  { codigo: '5070', valorReferencia: 350.0 },
  { codigo: '5080', valorReferencia: 420.0 },
  // Ortodontia (6000–6990)
  { codigo: '6000', valorReferencia: 350.0 },
  { codigo: '6010', valorReferencia: 180.0 },
  { codigo: '6020', valorReferencia: 280.0 },
  { codigo: '6030', valorReferencia: 850.0 },
  { codigo: '6040', valorReferencia: 150.0 },
  { codigo: '6050', valorReferencia: 220.0 },
]

async function main() {
  console.log('Seeding database...')

  // Seed Especialidades
  console.log('Seeding especialidades...')
  for (const esp of ESPECIALIDADES) {
    await prisma.especialidade.upsert({
      where: { codigo: esp.codigo },
      update: { nome: esp.nome, faixaInicio: esp.faixaInicio, faixaFim: esp.faixaFim },
      create: esp,
    })
  }
  console.log(`✓ ${ESPECIALIDADES.length} especialidades seeded`)

  // Seed VRPOReferencia
  console.log('Seeding VRPO references...')
  for (const ref of VRPO_REFERENCIAS) {
    await prisma.vRPOReferencia.upsert({
      where: { codigo: ref.codigo },
      update: { valorReferencia: ref.valorReferencia },
      create: ref,
    })
  }
  console.log(`✓ ${VRPO_REFERENCIAS.length} VRPO references seeded`)

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoFixoConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diasUteis" INTEGER NOT NULL DEFAULT 22,
    "horasTrabalho" INTEGER NOT NULL DEFAULT 8,
    "investimentoEquipamentos" DOUBLE PRECISION NOT NULL DEFAULT 61009,
    "anosDepreciacao" INTEGER NOT NULL DEFAULT 10,
    "salarioBase" DOUBLE PRECISION NOT NULL DEFAULT 6000,
    "percFundoReserva" DOUBLE PRECISION NOT NULL DEFAULT 11,
    "percInsalubridade" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "percImprevistos" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "taxaRetornoPerc" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "anosRetorno" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustoFixoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoFixoItem" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustoFixoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidade" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "faixaInicio" INTEGER NOT NULL,
    "faixaFim" INTEGER NOT NULL,

    CONSTRAINT "Especialidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedimento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidadeId" TEXT NOT NULL,
    "tempoMinutos" DOUBLE PRECISION NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedimentoMaterial" (
    "id" TEXT NOT NULL,
    "procedimentoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "consumo" TEXT NOT NULL,
    "divisor" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "ProcedimentoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VRPOReferencia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "valorReferencia" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VRPOReferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dados" JSONB NOT NULL,
    "custoFixoPorMinuto" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustoFixoConfig_userId_key" ON "CustoFixoConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidade_codigo_key" ON "Especialidade"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Procedimento_userId_codigo_key" ON "Procedimento"("userId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "VRPOReferencia_codigo_key" ON "VRPOReferencia"("codigo");

-- AddForeignKey
ALTER TABLE "CustoFixoConfig" ADD CONSTRAINT "CustoFixoConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustoFixoItem" ADD CONSTRAINT "CustoFixoItem_configId_fkey" FOREIGN KEY ("configId") REFERENCES "CustoFixoConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedimento" ADD CONSTRAINT "Procedimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedimento" ADD CONSTRAINT "Procedimento_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "Especialidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedimentoMaterial" ADD CONSTRAINT "ProcedimentoMaterial_procedimentoId_fkey" FOREIGN KEY ("procedimentoId") REFERENCES "Procedimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedimentoMaterial" ADD CONSTRAINT "ProcedimentoMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

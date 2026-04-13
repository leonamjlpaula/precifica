-- CreateIndex
CREATE INDEX "Material_userId_idx" ON "Material"("userId");

-- CreateIndex
CREATE INDEX "Procedimento_userId_idx" ON "Procedimento"("userId");

-- CreateIndex
CREATE INDEX "Procedimento_userId_especialidadeId_idx" ON "Procedimento"("userId", "especialidadeId");

-- CreateIndex
CREATE INDEX "ProcedimentoMaterial_procedimentoId_idx" ON "ProcedimentoMaterial"("procedimentoId");

-- CreateIndex
CREATE INDEX "ProcedimentoMaterial_materialId_idx" ON "ProcedimentoMaterial"("materialId");

-- CreateIndex
CREATE INDEX "Snapshot_userId_idx" ON "Snapshot"("userId");

-- DropForeignKey
ALTER TABLE "ProcedimentoMaterial" DROP CONSTRAINT "ProcedimentoMaterial_materialId_fkey";

-- AddForeignKey
ALTER TABLE "ProcedimentoMaterial" ADD CONSTRAINT "ProcedimentoMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

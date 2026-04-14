-- Add divisorPadrao to Material (default 1 for all existing rows)
ALTER TABLE "Material" ADD COLUMN "divisorPadrao" INTEGER NOT NULL DEFAULT 1;

-- Convert consumo from String to Float on ProcedimentoMaterial
-- Uses regexp_replace to extract the leading number from strings like "1 par", "2 películas", "cobertura" (→ 1)
ALTER TABLE "ProcedimentoMaterial" ADD COLUMN "consumo_new" DOUBLE PRECISION;

UPDATE "ProcedimentoMaterial"
SET "consumo_new" = CASE
  WHEN "consumo" ~ '^[0-9]'
  THEN REPLACE(
    regexp_replace("consumo", '^([0-9]+(?:[,\.][0-9]+)?).*', '\1'),
    ',', '.'
  )::DOUBLE PRECISION
  ELSE 1.0
END;

ALTER TABLE "ProcedimentoMaterial" ALTER COLUMN "consumo_new" SET NOT NULL;
ALTER TABLE "ProcedimentoMaterial" DROP COLUMN "consumo";
ALTER TABLE "ProcedimentoMaterial" RENAME COLUMN "consumo_new" TO "consumo";

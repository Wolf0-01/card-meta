-- Catálogo de Skills y efectos sincronizado desde Duel Links Meta.
CREATE TABLE "SkillMeta" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "format" TEXT NOT NULL DEFAULT 'speed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SkillMeta_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SkillMeta_name_idx" ON "SkillMeta"("name");

CREATE INDEX "SkillMeta_format_idx" ON "SkillMeta"("format");

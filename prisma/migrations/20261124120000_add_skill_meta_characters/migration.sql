-- Personajes que desbloquean cada Skill sincronizada desde Duel Links Meta.
ALTER TABLE "SkillMeta"
  ADD COLUMN "characters" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

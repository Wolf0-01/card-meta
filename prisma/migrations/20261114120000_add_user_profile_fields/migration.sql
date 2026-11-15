-- Renombra el avatar heredado y añade el orden preferido del
-- catálogo para el perfil de usuario.
ALTER TABLE "User" RENAME COLUMN "avatar" TO "avatarUrl";

ALTER TABLE "User"
  ADD COLUMN "defaultCardSort" TEXT NOT NULL DEFAULT 'rarity';

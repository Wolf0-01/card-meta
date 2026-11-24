-- Modo "No limits": ignora la banlist al validar el mazo.
ALTER TABLE "Deck" ADD COLUMN "noLimits" BOOLEAN NOT NULL DEFAULT false;

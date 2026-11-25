-- Inicio de sesión con Discord OAuth2.
-- La contraseña pasa a ser opcional para las cuentas que solo
-- se autentican con Discord.

ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "User"
  ADD COLUMN "discordId" TEXT;

CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

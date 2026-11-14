-- Reemplaza el enum antiguo (user/admin) por los roles
-- estrictos USER / EDITOR / ADMIN.
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole"
  USING (
    CASE "role"::text
      WHEN 'admin' THEN 'ADMIN'::"UserRole"
      WHEN 'editor' THEN 'EDITOR'::"UserRole"
      ELSE 'USER'::"UserRole"
    END
  );

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

DROP TYPE "UserRole_old";

-- El usuario principal de la base local pasa a ADMIN para
-- poder probar el editor y el panel de sincronización.
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "id" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" ASC, "id" ASC
  LIMIT 1
);

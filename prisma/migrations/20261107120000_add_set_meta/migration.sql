CREATE TABLE "SetMeta" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bannerUrl" TEXT,

    CONSTRAINT "SetMeta_pkey" PRIMARY KEY ("slug")
);

CREATE INDEX "SetMeta_name_idx" ON "SetMeta"("name");

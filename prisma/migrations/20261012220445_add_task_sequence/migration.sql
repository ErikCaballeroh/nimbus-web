-- AlterTable
ALTER TABLE "projects" ADD COLUMN "code_prefix" VARCHAR(10);
ALTER TABLE "projects" ADD COLUMN "task_seq" INTEGER NOT NULL DEFAULT 0;

-- Backfill: derive a deterministic prefix from each existing project's name
-- (first 3 letters, uppercased, padded with "X"), disambiguating collisions
-- with a numeric suffix. New projects get their prefix from application code
-- (features/projects/service.ts) using the same scheme.
WITH base AS (
  SELECT
    id,
    rpad(substring(upper(regexp_replace(name, '[^A-Za-z]', '', 'g')) FROM 1 FOR 3), 3, 'X') AS prefix,
    row_number() OVER (
      PARTITION BY rpad(substring(upper(regexp_replace(name, '[^A-Za-z]', '', 'g')) FROM 1 FOR 3), 3, 'X')
      ORDER BY created_at
    ) AS rn
  FROM "projects"
)
UPDATE "projects"
SET "code_prefix" = CASE WHEN base.rn = 1 THEN base.prefix ELSE base.prefix || base.rn::text END
FROM base
WHERE "projects"."id" = base.id;

ALTER TABLE "projects" ALTER COLUMN "code_prefix" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_prefix_key" ON "projects"("code_prefix");

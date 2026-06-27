-- AlterTable (support table naming differences across environments)
ALTER TABLE IF EXISTS "Project"
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "details" TEXT;

ALTER TABLE IF EXISTS "project"
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "details" TEXT;

ALTER TABLE IF EXISTS "projects"
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "details" TEXT;

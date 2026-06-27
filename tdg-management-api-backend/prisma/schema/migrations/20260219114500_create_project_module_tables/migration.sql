DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus') THEN
    CREATE TYPE "ProjectStatus" AS ENUM ('Pending', 'Running', 'Stopped', 'Completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BusinessUnit') THEN
    CREATE TYPE "BusinessUnit" AS ENUM ('TawerDev', 'TawerCreative');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unaccentedName" TEXT NOT NULL,
  "description" TEXT,
  "details" TEXT,
  "paid" BOOLEAN NOT NULL DEFAULT false,
  "status" "ProjectStatus" NOT NULL DEFAULT 'Pending',
  "businessUnit" "BusinessUnit" NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "estimatedStartDate" TIMESTAMP(3) NOT NULL,
  "estimatedEndDate" TIMESTAMP(3) NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 1000,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProjectContent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "details" TEXT,
  "projectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProjectContent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectContent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProjectMember" (
  "id" TEXT NOT NULL,
  "isManager" BOOLEAN NOT NULL DEFAULT false,
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");
CREATE INDEX IF NOT EXISTS "Project_businessUnit_idx" ON "Project"("businessUnit");
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");
CREATE INDEX IF NOT EXISTS "Project_createdById_idx" ON "Project"("createdById");
CREATE INDEX IF NOT EXISTS "Project_displayOrder_idx" ON "Project"("displayOrder");
CREATE INDEX IF NOT EXISTS "Project_estimatedStartDate_idx" ON "Project"("estimatedStartDate");
CREATE INDEX IF NOT EXISTS "Project_estimatedEndDate_idx" ON "Project"("estimatedEndDate");
CREATE INDEX IF NOT EXISTS "Project_name_idx" ON "Project"("name");
CREATE INDEX IF NOT EXISTS "ProjectContent_projectId_idx" ON "ProjectContent"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectMember_userId_idx" ON "ProjectMember"("userId");

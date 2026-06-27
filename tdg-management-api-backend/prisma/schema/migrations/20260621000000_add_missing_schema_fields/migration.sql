-- Align DB schema with current Prisma schema
-- Project table: drop old columns, add new ones
ALTER TABLE "Project" DROP COLUMN IF EXISTS "name";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "unaccentedName";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "details";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "sprintsCount";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "tasksCount";

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(6);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "kanbanSettings" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "projectType" TEXT NOT NULL DEFAULT 'AGILE';

DROP INDEX IF EXISTS "Project_name_idx";
CREATE INDEX IF NOT EXISTS "Project_isArchived_idx" ON "Project"("isArchived");
CREATE INDEX IF NOT EXISTS "Project_projectType_idx" ON "Project"("projectType");

-- ProjectContent: drop old columns, add language and unaccentedName
ALTER TABLE "ProjectContent" DROP COLUMN IF EXISTS "name";
ALTER TABLE "ProjectContent" DROP COLUMN IF EXISTS "description";
ALTER TABLE "ProjectContent" DROP COLUMN IF EXISTS "details";

ALTER TABLE "ProjectContent" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProjectContent" ADD COLUMN IF NOT EXISTS "unaccentedName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProjectContent" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "ProjectContent" ADD COLUMN IF NOT EXISTS "details" TEXT;
ALTER TABLE "ProjectContent" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'English';

CREATE INDEX IF NOT EXISTS "ProjectContent_language_idx" ON "ProjectContent"("language");
CREATE INDEX IF NOT EXISTS "ProjectContent_name_idx" ON "ProjectContent"("name");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectContent_language_name_key'
  ) THEN
    ALTER TABLE "ProjectContent" ADD CONSTRAINT "ProjectContent_language_name_key" UNIQUE ("language", "name");
  END IF;
END $$;

-- Add missing columns to Sprint
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "capacity" INTEGER;

-- Add missing columns to Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "progressPercent" INTEGER DEFAULT 0;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "archived" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Task_isFavorite_idx" ON "Task"("isFavorite");
CREATE INDEX IF NOT EXISTS "Task_archived_idx" ON "Task"("archived");
CREATE INDEX IF NOT EXISTS "Task_projectId_displayOrder_idx" ON "Task"("projectId", "displayOrder");

-- Milestone: add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Milestone_projectId_name_key'
  ) THEN
    ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_name_key" UNIQUE ("projectId", "name");
  END IF;
END $$;

-- ProjectInvitation table (in schema but not in any migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvitationStatus') THEN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProjectInvitation" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "isManager" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(6) NOT NULL,
  "acceptedAt" TIMESTAMP(6),
  "invitedUserId" TEXT,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "invitedById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectInvitation_projectId_email_key" ON "ProjectInvitation"("projectId", "email");
CREATE INDEX IF NOT EXISTS "ProjectInvitation_projectId_idx" ON "ProjectInvitation"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectInvitation_token_idx" ON "ProjectInvitation"("token");

-- Add missing TaskStatusType enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatusType') THEN
    CREATE TYPE "TaskStatusType" AS ENUM ('ENUM', 'CUSTOM');
  END IF;
END $$;

-- Add statusType to Task if missing
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "statusType" TEXT NOT NULL DEFAULT 'ENUM';

-- Add missing ReminderStatus CANCELLED value
ALTER TYPE "ReminderStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Add hourlyRate columns (from cost tracking migration, may be missing from ProjectMember)
ALTER TABLE "ProjectMember" ADD COLUMN IF NOT EXISTS "hourlyRate" DECIMAL(10,2);

-- TaskLabel (in schema but not in any migration)
CREATE TABLE IF NOT EXISTS "TaskLabel" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskLabel_projectId_name_key" ON "TaskLabel"("projectId", "name");
CREATE INDEX IF NOT EXISTS "TaskLabel_projectId_idx" ON "TaskLabel"("projectId");

-- TaskLabelAssignment
CREATE TABLE IF NOT EXISTS "TaskLabelAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "taskId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
    "labelId" TEXT NOT NULL REFERENCES "TaskLabel"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskLabelAssignment_taskId_labelId_key" ON "TaskLabelAssignment"("taskId", "labelId");
CREATE INDEX IF NOT EXISTS "TaskLabelAssignment_taskId_idx" ON "TaskLabelAssignment"("taskId");
CREATE INDEX IF NOT EXISTS "TaskLabelAssignment_labelId_idx" ON "TaskLabelAssignment"("labelId");

-- TaskContent
CREATE TABLE IF NOT EXISTS "TaskContent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "taskId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "details" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskContent_taskId_language_key" ON "TaskContent"("taskId", "language");
CREATE INDEX IF NOT EXISTS "TaskContent_taskId_idx" ON "TaskContent"("taskId");

-- TaskDependency
CREATE TABLE IF NOT EXISTS "TaskDependency" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "blockingTaskId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
    "blockedTaskId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
    "dependencyType" TEXT NOT NULL DEFAULT 'blocks',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskDependency_blocking_blocked_key" ON "TaskDependency"("blockingTaskId", "blockedTaskId");
CREATE INDEX IF NOT EXISTS "TaskDependency_blockingTaskId_idx" ON "TaskDependency"("blockingTaskId");
CREATE INDEX IF NOT EXISTS "TaskDependency_blockedTaskId_idx" ON "TaskDependency"("blockedTaskId");

-- TaskCommentLike
CREATE TABLE IF NOT EXISTS "TaskCommentLike" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "commentId" TEXT NOT NULL REFERENCES "TaskComment"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskCommentLike_commentId_userId_key" ON "TaskCommentLike"("commentId", "userId");
CREATE INDEX IF NOT EXISTS "TaskCommentLike_userId_idx" ON "TaskCommentLike"("userId");

-- TaskCommentMention
CREATE TABLE IF NOT EXISTS "TaskCommentMention" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "commentId" TEXT NOT NULL REFERENCES "TaskComment"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskCommentMention_commentId_userId_key" ON "TaskCommentMention"("commentId", "userId");
CREATE INDEX IF NOT EXISTS "TaskCommentMention_userId_idx" ON "TaskCommentMention"("userId");

-- TaskAttachment
CREATE TABLE IF NOT EXISTS "TaskAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "taskId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
    "file" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "TaskAttachment_taskId_idx" ON "TaskAttachment"("taskId");

-- ProjectTaskStatus
CREATE TABLE IF NOT EXISTS "ProjectTaskStatus" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "allowedTransitions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectTaskStatus_projectId_name_key" ON "ProjectTaskStatus"("projectId", "name");
CREATE INDEX IF NOT EXISTS "ProjectTaskStatus_projectId_isArchived_idx" ON "ProjectTaskStatus"("projectId", "isArchived");
CREATE INDEX IF NOT EXISTS "ProjectTaskStatus_projectId_order_idx" ON "ProjectTaskStatus"("projectId", "order");

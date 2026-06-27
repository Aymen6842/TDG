-- Migration: Phase 5 - Agile & Reminders
-- Date: 2026-02-20
-- Description: Add projectType, Task, Epic, Milestone, Reminder models

-- Drop existing enums if they exist (to handle re-runs)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminderstatus') THEN
        DROP TYPE IF EXISTS "ReminderStatus" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminderentitytype') THEN
        DROP TYPE IF EXISTS "ReminderEntityType" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channetype') THEN
        DROP TYPE IF EXISTS "ChannelType" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskstatus') THEN
        DROP TYPE IF EXISTS "TaskStatus" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskpriority') THEN
        DROP TYPE IF EXISTS "TaskPriority" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasktype') THEN
        DROP TYPE IF EXISTS "TaskType" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sprintstatus') THEN
        DROP TYPE IF EXISTS "SprintStatus" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'projecttype') THEN
        DROP TYPE IF EXISTS "ProjectType" CASCADE;
    END IF;
END $$;

-- Create enums
CREATE TYPE "ProjectType" AS ENUM ('AGILE', 'FREESTYLE');
CREATE TYPE "SprintStatus" AS ENUM ('Pending', 'Running', 'Stopped', 'Completed');
CREATE TYPE "TaskType" AS ENUM ('EPIC', 'STORY', 'TASK', 'BUG', 'SPIKE');
CREATE TYPE "TaskPriority" AS ENUM ('URGENT', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'DONE');
CREATE TYPE "ReminderEntityType" AS ENUM ('TASK', 'SPRINT', 'MILESTONE', 'PROJECT', 'CUSTOM');
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'DISMISSED', 'FAILED');
CREATE TYPE "ChannelType" AS ENUM ('EMAIL', 'TELEGRAM', 'PUSH', 'NTFY');

-- Add projectType to Project (default AGILE for existing projects)
ALTER TABLE "Project" ADD COLUMN "projectType" "ProjectType" NOT NULL DEFAULT 'AGILE';
CREATE INDEX "Project_projectType_idx" ON "Project" ("projectType");

-- Create Sprint model
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL,
    "endDate" TIMESTAMP(6) NOT NULL,
    "estimatedStartDate" TIMESTAMP(6) NOT NULL,
    "estimatedEndDate" TIMESTAMP(6) NOT NULL,
    "status" "SprintStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sprint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Sprint_projectId_status_idx" ON "Sprint" ("projectId", "status");
CREATE INDEX "Sprint_projectId_createdAt_idx" ON "Sprint" ("projectId", "createdAt");

-- Create SprintContent model
CREATE TABLE "SprintContent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sprintId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unaccentedName" TEXT NOT NULL,
    "description" TEXT,
    "details" TEXT,
    "language" "Language" NOT NULL DEFAULT 'English',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SprintContent_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SprintContent_language_name_key" ON "SprintContent" ("language", "name");
CREATE INDEX "SprintContent_sprintId_idx" ON "SprintContent" ("sprintId");

-- Create SprintAttachment model
CREATE TABLE "SprintAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sprintId" TEXT NOT NULL,
    "attachment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SprintAttachment_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "SprintAttachment_sprintId_idx" ON "SprintAttachment" ("sprintId");

-- Create Task model
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "TaskType" NOT NULL DEFAULT 'TASK',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "assigneeId" TEXT,
    "reporterId" TEXT NOT NULL,
    "sprintId" TEXT,
    "epicId" TEXT,
    "storyPoints" INTEGER,
    "milestoneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(6),
    "completedAt" TIMESTAMP(6),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "parentTaskId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Task_projectId_key_key" ON "Task" ("projectId", "key");
CREATE INDEX "Task_projectId_status_idx" ON "Task" ("projectId", "status");
CREATE INDEX "Task_assigneeId_idx" ON "Task" ("assigneeId");
CREATE INDEX "Task_sprintId_idx" ON "Task" ("sprintId");
CREATE INDEX "Task_epicId_idx" ON "Task" ("epicId");
CREATE INDEX "Task_milestoneId_idx" ON "Task" ("milestoneId");

-- Create TaskComment model
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment" ("taskId");

-- Create TaskTimeEntry model
CREATE TABLE "TaskTimeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workSessionId" TEXT,
    "hours" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskTimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskTimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskTimeEntry_workSessionId_fkey" FOREIGN KEY ("workSessionId") REFERENCES "WorkSession"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "TaskTimeEntry_taskId_idx" ON "TaskTimeEntry" ("taskId");
CREATE INDEX "TaskTimeEntry_userId_idx" ON "TaskTimeEntry" ("userId");

-- Create Epic model
CREATE TABLE "Epic" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "startDate" TIMESTAMP(6),
    "endDate" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Epic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Epic_projectId_name_key" ON "Epic" ("projectId", "name");
CREATE INDEX "Epic_projectId_idx" ON "Epic" ("projectId");

-- Add epicId to Task (after Epic is created)
ALTER TABLE "Task" ADD CONSTRAINT "Task_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create Milestone model
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(6),
    "completedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Milestone_projectId_idx" ON "Milestone" ("projectId");
CREATE INDEX "Milestone_dueDate_idx" ON "Milestone" ("dueDate");

-- Add milestoneId to Task (after Milestone is created)
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create TaskDependency model
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "blockingTaskId" TEXT NOT NULL,
    "blockedTaskId" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL DEFAULT 'blocks',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskDependency_blockingTaskId_fkey" FOREIGN KEY ("blockingTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskDependency_blockedTaskId_fkey" FOREIGN KEY ("blockedTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TaskDependency_blocking_blocked_key" ON "TaskDependency" ("blockingTaskId", "blockedTaskId");
CREATE INDEX "TaskDependency_blockingTaskId_idx" ON "TaskDependency" ("blockingTaskId");
CREATE INDEX "TaskDependency_blockedTaskId_idx" ON "TaskDependency" ("blockedTaskId");

-- Create Reminder model
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "entityType" "ReminderEntityType" NOT NULL,
    "entityId" TEXT,
    "projectId" TEXT,
    "taskId" TEXT,
    "milestoneId" TEXT,
    "message" TEXT,
    "reminderAt" TIMESTAMP(6) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "createdById" TEXT NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(6),
    "dismissedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Reminder_status_reminderAt_idx" ON "Reminder" ("status", "reminderAt");
CREATE INDEX "Reminder_userId_status_idx" ON "Reminder" ("userId", "status");
CREATE INDEX "Reminder_projectId_idx" ON "Reminder" ("projectId");

-- Create ReminderChannel model
CREATE TABLE "ReminderChannel" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "reminderId" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    CONSTRAINT "ReminderChannel_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ReminderChannel_reminderId_channel_key" ON "ReminderChannel" ("reminderId", "channel");

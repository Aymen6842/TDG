-- Phase 5.2: migrate Task.status from the "TaskStatus" enum to a free String (TEXT)
-- column, so project-defined custom statuses (ProjectTaskStatus.name) can be
-- persisted. The enum's 6 labels cast to identical text, so every existing
-- task's status value is preserved unchanged. The "Task_projectId_status_idx"
-- index is rebuilt automatically by Postgres during the type change.

-- Drop the enum-typed default before changing the column type.
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;

-- Convert enum -> text; ::text yields each enum member's label verbatim.
ALTER TABLE "Task" ALTER COLUMN "status" SET DATA TYPE TEXT USING "status"::text;

-- Restore the default as a text literal.
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- "Task"."status" was the only user of the enum type; drop it to keep the
-- database in sync with the schema, which no longer declares it.
DROP TYPE "TaskStatus";

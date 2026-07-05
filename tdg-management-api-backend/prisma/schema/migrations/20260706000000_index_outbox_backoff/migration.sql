-- Incremental-indexing freshness (Sprint 5 / M3).
--
-- Extends the IndexOutbox work queue with the fields the cron sweeper needs to
-- schedule retries with exponential backoff and to record the last failure.
-- The hot claim query filters by (status, nextAttemptAt), so the covering index
-- is swapped from (status, createdAt) to (status, nextAttemptAt).

-- AlterTable
ALTER TABLE "IndexOutbox"
  ADD COLUMN "nextAttemptAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "lastError" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropIndex
DROP INDEX "IndexOutbox_status_createdAt_idx";

-- CreateIndex
CREATE INDEX "IndexOutbox_status_nextAttemptAt_idx" ON "IndexOutbox"("status", "nextAttemptAt");

-- AI vector-search foundation (Sprint 2 / M0).
--
-- Enables pgvector and creates the embedding store + indexing outbox + copilot
-- telemetry tables. The `DocumentEmbedding.embedding` column is a native
-- pgvector `vector(1536)` (modelled as Prisma `Unsupported`), and the HNSW ANN
-- index is created by hand at the end because Prisma cannot emit it.

-- pgvector must exist before any `vector(...)` column can be created.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "EmbeddingEntityType" AS ENUM ('TASK', 'TASK_COMMENT', 'EPIC', 'MILESTONE', 'SPRINT');

-- CreateEnum
CREATE TYPE "IndexOp" AS ENUM ('UPSERT', 'DELETE');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "DocumentEmbedding" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL,
    "entityType" "EmbeddingEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(1536) NOT NULL,
    "contentHash" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gemini-embedding-001',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexOutbox" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "projectId" TEXT NOT NULL,
    "entityType" "EmbeddingEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "op" "IndexOp" NOT NULL DEFAULT 'UPSERT',
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndexOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopilotQueryLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "question" TEXT NOT NULL,
    "retrievedIds" TEXT[],
    "topScore" DOUBLE PRECISION,
    "answer" TEXT NOT NULL,
    "citationsCount" INTEGER NOT NULL DEFAULT 0,
    "faithfulnessScore" DOUBLE PRECISION,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopilotQueryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentEmbedding_projectId_entityType_idx" ON "DocumentEmbedding"("projectId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentEmbedding_entityType_entityId_chunkIndex_key" ON "DocumentEmbedding"("entityType", "entityId", "chunkIndex");

-- CreateIndex
CREATE INDEX "IndexOutbox_status_createdAt_idx" ON "IndexOutbox"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IndexOutbox_entityType_entityId_key" ON "IndexOutbox"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CopilotQueryLog_userId_createdAt_idx" ON "CopilotQueryLog"("userId", "createdAt");

-- HNSW ANN index for cosine-distance vector search (Prisma cannot emit this).
CREATE INDEX "document_embedding_hnsw"
  ON "DocumentEmbedding"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Hybrid lexical + vector search (Sprint 7 / M5).
--
-- Adds a Postgres full-text-search (`tsvector`) column over the embedded chunk
-- text so the retriever can run a BM25-style lexical query (`ts_rank_cd`)
-- alongside the pgvector ANN, then fuse the two ranked lists with Reciprocal
-- Rank Fusion (see RetrievalService). The column is GENERATED ALWAYS ... STORED,
-- so it is populated for every existing row at migration time and stays in sync
-- automatically on insert/update — no backfill and no write-path change needed.
-- The GIN index makes the lexical match/rank fast; Prisma cannot emit either the
-- generated column or the GIN index, so both are created by hand here (mirroring
-- how the HNSW ANN index is created in 20260705000000_add_pgvector_ai_tables).

-- Generated FTS vector over the exact embedded content (English config, matching
-- the corpus language). `to_tsvector('english', ...)` is IMMUTABLE, so it is a
-- legal STORED generated expression.
ALTER TABLE "DocumentEmbedding"
  ADD COLUMN "contentTsv" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', "content")) STORED;

-- GIN index for fast `@@` match + `ts_rank_cd` scoring.
CREATE INDEX "document_embedding_content_tsv_gin"
  ON "DocumentEmbedding"
  USING gin ("contentTsv");

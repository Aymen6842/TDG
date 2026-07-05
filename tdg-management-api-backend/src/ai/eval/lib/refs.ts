/**
 * Canonical entity references for the gold sets (§6).
 *
 * `DocumentEmbedding.entityId` is a `gen_random_uuid()` that changes on every
 * re-seed, so the hand-labeled gold files can't reference it. Instead the gold
 * sets use *stable, human-readable* refs and this module resolves a retrieved
 * row back to the same ref so they can be compared:
 *
 *   TASK       → `TASK:NDF-3`          (task business key)
 *   TASK_COMMENT → `COMMENT:NDF-3`     (a comment on task NDF-3)
 *   EPIC       → `EPIC:Route Optimization`
 *   MILESTONE  → `MILESTONE:Beta — Route Optimization`
 *   SPRINT     → `SPRINT:NDF Sprint 2 — Telemetry Ingestion`
 *
 * A comment ref intentionally resolves only to its parent task's key, not to the
 * individual comment id — for a small grounding gold set "the decision comment on
 * NDF-3" is the unit of relevance, and a task may carry several comments.
 */
import { EmbeddingEntityType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

/** An (entityType, entityId) pair as stored on a retrieval hit / citation. */
export interface EntityRefInput {
  entityType: EmbeddingEntityType;
  entityId: string;
}

/**
 * Batch resolver: builds lookup maps once, then turns any retrieved
 * (entityType, entityId) into its canonical ref string. Unknown ids resolve to
 * `TYPE:<unresolved:id>` so they never silently match a gold ref.
 */
export class RefResolver {
  private taskKeyById = new Map<string, string>();
  private commentTaskKeyById = new Map<string, string>();
  private epicNameById = new Map<string, string>();
  private milestoneNameById = new Map<string, string>();
  private sprintNameById = new Map<string, string>();

  private constructor() {}

  static async build(prisma: PrismaService): Promise<RefResolver> {
    const resolver = new RefResolver();

    const tasks = await prisma.task.findMany({
      select: { id: true, key: true },
    });
    for (const t of tasks) resolver.taskKeyById.set(t.id, t.key);

    const comments = await prisma.taskComment.findMany({
      select: { id: true, task: { select: { key: true } } },
    });
    for (const c of comments) {
      resolver.commentTaskKeyById.set(c.id, c.task.key);
    }

    const epics = await prisma.epic.findMany({
      select: { id: true, name: true },
    });
    for (const e of epics) resolver.epicNameById.set(e.id, e.name);

    const milestones = await prisma.milestone.findMany({
      select: { id: true, name: true },
    });
    for (const m of milestones) resolver.milestoneNameById.set(m.id, m.name);

    const sprints = await prisma.sprint.findMany({
      select: {
        id: true,
        contents: { select: { name: true, language: true } },
      },
    });
    for (const s of sprints) {
      const content =
        s.contents.find((row) => row.language === 'English') ?? s.contents[0];
      resolver.sprintNameById.set(s.id, content?.name ?? 'Sprint');
    }

    return resolver;
  }

  /** Canonical ref for a retrieved row / citation, e.g. `TASK:NDF-3`. */
  toRef(input: EntityRefInput): string {
    const { entityType, entityId } = input;
    switch (entityType) {
      case EmbeddingEntityType.TASK:
        return `TASK:${this.taskKeyById.get(entityId) ?? `unresolved:${entityId}`}`;
      case EmbeddingEntityType.TASK_COMMENT:
        return `COMMENT:${this.commentTaskKeyById.get(entityId) ?? `unresolved:${entityId}`}`;
      case EmbeddingEntityType.EPIC:
        return `EPIC:${this.epicNameById.get(entityId) ?? `unresolved:${entityId}`}`;
      case EmbeddingEntityType.MILESTONE:
        return `MILESTONE:${this.milestoneNameById.get(entityId) ?? `unresolved:${entityId}`}`;
      case EmbeddingEntityType.SPRINT:
        return `SPRINT:${this.sprintNameById.get(entityId) ?? `unresolved:${entityId}`}`;
      default:
        return `${String(entityType)}:${entityId}`;
    }
  }
}

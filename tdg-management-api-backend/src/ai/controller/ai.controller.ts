import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Sse,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

import { IndexingService } from '../services/indexing.service';
import { EstimationService } from '../services/estimation.service';
import { CopilotService } from '../services/copilot.service';
import {
  TelemetryService,
  CopilotTelemetrySummary,
} from '../services/telemetry.service';
import { EstimateTaskDto } from '../dto/request/estimate-task.dto';
import { EstimateResultDto } from '../dto/response/estimate-result.dto';
import { CopilotQueryDto } from '../dto/request/copilot-query.dto';
import { CopilotStreamQueryDto } from '../dto/request/copilot-stream-query.dto';
import { CopilotAnswerDto } from '../dto/response/copilot-answer.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly indexingService: IndexingService,
    private readonly estimationService: EstimationService,
    private readonly copilotService: CopilotService,
    private readonly telemetryService: TelemetryService,
  ) {}

  /**
   * Permission-scoped RAG copilot (§4.5 / §4.7). Answers a natural-language
   * question grounded ONLY in retrieved project content, with clickable
   * citations to the exact task/comment used. Non-streaming JSON this sprint.
   * Guarded like task reads; 403s if `projectId` is outside the caller's scope,
   * and refuses honestly when retrieval is too weak to answer.
   */
  @Post('copilot/query')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @ApiOperation({ summary: 'Ask the project copilot a grounded question' })
  @ApiResponse({
    status: 200,
    description: 'Grounded answer with citations (or an honest refusal).',
    type: CopilotAnswerDto,
  })
  @ApiResponse({ status: 403, description: 'Project outside allowed scope.' })
  copilotQuery(
    @Request() req: CustomRequest,
    @Body() dto: CopilotQueryDto,
  ): Promise<CopilotAnswerDto> {
    const user = req.user!;
    return this.copilotService.answer({
      userId: user.id,
      roles: user.roles,
      projectId: dto.projectId,
      question: dto.question,
    });
  }

  /**
   * Streaming (SSE) counterpart of `POST /ai/copilot/query` (§4.5 step 5 / §4.7).
   * Runs the identical permission-scoped retrieve→ground pipeline, but streams
   * the answer token-by-token as `token` events and delivers the resolved
   * `citations[]` in a final `final` event. A GET so the browser can open it as
   * an event stream; guarded and scoped exactly like the JSON endpoint (an
   * out-of-scope `projectId` yields an `error` event). The `CopilotQueryLog`
   * receipt is still written when the stream ends.
   */
  @Sse('copilot/stream')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @ApiOperation({ summary: 'Stream a grounded copilot answer over SSE' })
  copilotStream(
    @Request() req: CustomRequest,
    @Query() dto: CopilotStreamQueryDto,
  ): Observable<MessageEvent> {
    const user = req.user!;
    return this.copilotService.answerStream({
      userId: user.id,
      roles: user.roles,
      projectId: dto.projectId,
      question: dto.question,
    });
  }

  /**
   * Retrieval-based effort estimate for a draft task (§4.6). Grounded in the
   * real `actualHours` of the most similar completed tasks the user is allowed
   * to see. Guarded like task creation; the service 403s if `projectId` is
   * outside the caller's allowed scope.
   */
  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_CREATE])
  @ApiOperation({ summary: 'Estimate effort for a draft task from history' })
  @ApiResponse({
    status: 200,
    description: 'Estimate with neighbor tasks as evidence.',
    type: EstimateResultDto,
  })
  @ApiResponse({ status: 403, description: 'Project outside allowed scope.' })
  estimate(
    @Request() req: CustomRequest,
    @Body() dto: EstimateTaskDto,
  ): Promise<EstimateResultDto> {
    const user = req.user!;
    return this.estimationService.estimate({
      userId: user.id,
      roles: user.roles,
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description,
      storyPoints: dto.storyPoints,
    });
  }

  /**
   * Admin-only backfill trigger: (re)embeds all existing project content into
   * `DocumentEmbedding`. Idempotent — unchanged content is skipped by hash.
   * Restricted to executives via the project-create permission.
   */
  @Post('admin/reindex')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_CREATE])
  @ApiOperation({
    summary: 'Backfill / rebuild all content embeddings (admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reindex summary (per-entity counts).',
  })
  reindex() {
    return this.indexingService.reindexAll();
  }

  /**
   * Copilot telemetry rollup for the eval dashboard (§6): latency p50/p95, mean
   * faithfulness, refusal rate, average retrieval top-score and citations over
   * all logged `CopilotQueryLog` calls. Executive-only, like the reindex trigger.
   */
  @Get('telemetry')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_CREATE])
  @ApiOperation({ summary: 'Copilot telemetry summary (admin dashboard)' })
  @ApiResponse({ status: 200, description: 'Aggregated copilot telemetry.' })
  telemetry(): Promise<CopilotTelemetrySummary> {
    return this.telemetryService.copilotSummary();
  }
}

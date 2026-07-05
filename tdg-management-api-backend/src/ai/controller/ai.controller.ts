import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

import { IndexingService } from '../services/indexing.service';
import { EstimationService } from '../services/estimation.service';
import { EstimateTaskDto } from '../dto/request/estimate-task.dto';
import { EstimateResultDto } from '../dto/response/estimate-result.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly indexingService: IndexingService,
    private readonly estimationService: EstimationService,
  ) {}

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
  @ApiOperation({ summary: 'Backfill / rebuild all content embeddings (admin)' })
  @ApiResponse({ status: 200, description: 'Reindex summary (per-entity counts).' })
  reindex() {
    return this.indexingService.reindexAll();
  }
}

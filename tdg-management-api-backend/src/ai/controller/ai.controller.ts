import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';

import { IndexingService } from '../services/indexing.service';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly indexingService: IndexingService) {}

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

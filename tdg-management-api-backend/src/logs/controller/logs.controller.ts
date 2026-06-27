import {
  Controller,
  Get,
  Param,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import { LogsService } from '../services/logs.service';
import { Response as ResponseExpress } from 'express';
import { FilterLogsParameters } from '../types/request.type';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { Permissions } from 'src/auths/decorators/permissions.decorator';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.LOGS.LOG_FOLDERS_READ])
  listLogsFolders() {
    return this.logsService.listLogsFolders();
  }

  @Get(':folder/:file')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.LOGS.LOG_FILE_READ])
  parseLogFile(
    @Param('folder') folder: string,
    @Param('file') file: string,
    @Query() query: FilterLogsParameters,
  ) {
    return this.logsService.parseLogFile(folder, file, query);
  }

  @Get(':folder/:file/download')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.LOGS.LOG_FILE_DOWNLOAD])
  downloadLogFile(
    @Param('folder') folder: string,
    @Param('file') file: string,
    @Response() res: ResponseExpress,
  ) {
    return this.logsService.downloadLogFile(folder, file, res);
  }
}

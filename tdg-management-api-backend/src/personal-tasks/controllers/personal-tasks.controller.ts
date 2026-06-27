import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Query,
  UseGuards,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import { PersonalTasksService } from '../services/personal-tasks.service';
import { CustomRequest } from 'src/common/types/request.type';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  PersonalTaskNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import { CreatePersonalTaskDto } from '../dto/request/post/create-personal-task.dto';
import { CreatedPersonalTaskDto } from '../dto/response/post/created-personal-task.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadStorage } from 'src/common/upload/upload.storage';
import { CreatePersonalTaskCommentDto } from '../dto/request/post/create-personal-task-comment.dto';
import { CreatedPersonalTaskCommentDto } from '../dto/response/post/created-personal-task-comment.dto';
import { UpdatePersonalTaskDto } from '../dto/request/update/update-personal-task.dto';
import { UpdatedPersonalTaskDto } from '../dto/response/update/updated-personal-task.dto';
import { PersonalTaskSummaryDto } from '../dto/response/fetch/personal-task-summary.dto';
import { FilterPersonalTasksParametersDto } from '../dto/request/fetch/filter-personal-tasks-parameters.dto';
import { PersonalTaskDetailsDto } from '../dto/response/fetch/personal-task-details.dto';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';

@Controller('personal-tasks')
export class PersonalTasksController {
  constructor(private readonly PersonalTasksService: PersonalTasksService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_CREATE])
  @ApiBody({ type: CreatePersonalTaskDto })
  @ApiCreatedResponse({
    description: 'Success Registration!',
    type: CreatedPersonalTaskDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 50 }],
      UploadStorage.UserPersonalTasksAttachments(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: CreatedPersonalTaskDto })
  createPersonalTask(
    @Request() req: CustomRequest,
    @UploadedFiles() attachments: { attachments?: Express.Multer.File[] },
    @Body() data: CreatePersonalTaskDto,
  ) {
    return this.PersonalTasksService.createPersonalTask(req, attachments, data);
  }

  @Post('comments/register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_COMMENT_CREATE])
  @ApiCreatedResponse({
    description: 'Success Registration!',
    type: CreatedPersonalTaskCommentDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(PersonalTaskNotFoundApiResponse)
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedPersonalTaskCommentDto })
  createPersonalTaskComment(
    @Request() req: CustomRequest,
    @Body() data: CreatePersonalTaskCommentDto,
  ) {
    return this.PersonalTasksService.createPersonalTaskComment(req, data);
  }

  @Patch(':id')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_UPDATE])
  @ApiBody({ type: UpdatePersonalTaskDto })
  @ApiOkResponse({
    description: 'Success Registration!',
    type: UpdatedPersonalTaskDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(PersonalTaskNotFoundApiResponse)
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 50 }],
      UploadStorage.UserPersonalTasksAttachments(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: UpdatedPersonalTaskDto })
  updatePersonalTask(
    @Request() req: CustomRequest,
    @Param('id') id: string,
    @UploadedFiles() attachments: { attachments?: Express.Multer.File[] },
    @Body() data: UpdatePersonalTaskDto,
  ) {
    return this.PersonalTasksService.updatePersonalTask(
      req,
      id,
      attachments,
      data,
    );
  }

  @Delete(':id')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_DELETE])
  @ApiNoContentResponse({
    description: 'Success Deletion!',
  })
  @ApiResponse(PersonalTaskNotFoundApiResponse)
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  deletePersonalTask(@Request() req: CustomRequest, @Param('id') id: string) {
    return this.PersonalTasksService.deletePersonalTask(req, id);
  }

  @Delete('comments/:id')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_COMMENT_DELETE])
  @ApiNoContentResponse({
    description: 'Success Deletion!',
  })
  @ApiResponse(PersonalTaskNotFoundApiResponse)
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  deletePersonalTaskComment(
    @Request() req: CustomRequest,
    @Param('id') id: string,
  ) {
    return this.PersonalTasksService.deletePersonalTaskComment(req, id);
  }

  @Get()
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_READ_MANY])
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'List of available Personal Tasks',
    type: PersonalTaskSummaryDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'archived',
    required: false,
    description: 'Filter by archived status (true or false)',
    example: 'false',
  })
  @ApiQuery({
    name: 'isFavorite',
    required: false,
    description: 'Filter by favorite status (true or false)',
    example: 'false',
  })
  @ApiQuery({
    name: 'statuses',
    required: false,
    description:
      'Filter by task statuses (comma-separated, e.g., Pending,InProgress)',
    example: 'Pending,InProgress',
  })
  @ApiQuery({
    name: 'priorities',
    required: false,
    description:
      'Filter by task priorities (comma-separated, e.g., High,Medium)',
    example: 'High,Medium',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description:
      'Sort results by status or priority (comma-separated, e.g., statusAsc,priorityDesc)',
    example: 'statusAsc,priorityDesc',
  })
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PersonalTaskSummaryDto })
  filterPersonalTasks(
    @Request() req: CustomRequest,
    @Query() query: FilterPersonalTasksParametersDto,
  ) {
    return this.PersonalTasksService.filterPersonalTasks(req, query);
  }

  @Get(':id')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PERSONAL_TASKS.PERSONAL_TASK_READ_BY_ID])
  @ApiOkResponse({
    description: 'Success Retrieval!',
    type: PersonalTaskDetailsDto,
  })
  @ApiResponse(PersonalTaskNotFoundApiResponse)
  @ApiUnauthorizedResponse()
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PersonalTaskDetailsDto })
  getPersonalTask(@Request() req: CustomRequest, @Param('id') id: string) {
    return this.PersonalTasksService.getPersonalTaskById(req, id);
  }
}

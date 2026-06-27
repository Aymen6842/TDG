import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Get,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import {
  ApiBody,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  EventNotFoundApiResponse,
  InternalServerErrorApiResponse,
  UserNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import { CreateEventDto } from '../dto/request/post/create-event.dto';
import { CreatedEventDto } from '../dto/response/post/created-event.dto';
import { CustomRequest } from 'src/common/types/request.type';
import { UpdatedEventDto } from '../dto/response/update/updated-event.dto';
import { UpdateEventDto } from '../dto/request/update/update-event.dto';
import { FilterEventsParamsDto } from '../dto/request/fetch/filter-events-params.dto';
import { EventsInPeriodDto } from '../dto/response/fetch/events-in-period.dto';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { EventType } from '@prisma/client';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.EVENTS.EVENT_CREATE])
  @ApiBody({ type: CreateEventDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer token123',
  })
  @ApiOkResponse({ type: CreatedEventDto })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedEventDto })
  async createEvent(@Req() req: CustomRequest, @Body() data: CreateEventDto) {
    return await this.eventsService.createEvent(req, data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.EVENTS.EVENT_UPDATE])
  @ApiBody({ type: UpdateEventDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer token123',
  })
  @ApiOkResponse({ type: UpdatedEventDto })
  @ApiResponse(EventNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedEventDto })
  async updateEvent(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() data: UpdateEventDto,
  ) {
    return await this.eventsService.updateEvent(req, id, data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.EVENTS.EVENT_READ])
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer token123',
  })
  @ApiQuery({
    name: 'from',
    description: 'Start date of the period in ISO 8601 format.',
    required: true,
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'End date of the period in ISO 8601 format.',
    required: true,
    example: '2025-01-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of the event to filter by.',
    required: false,
    enum: EventType,
    example: EventType.Meeting,
  })
  @ApiOkResponse({ type: EventsInPeriodDto })
  @ApiResponse(EventNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: EventsInPeriodDto })
  async fetchEventsByPeriod(
    @Req() req: CustomRequest,
    @Query() query: FilterEventsParamsDto,
  ) {
    return await this.eventsService.fetchEventsByPeriod(req, query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.EVENTS.EVENT_DELETE])
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer token123',
  })
  @ApiNoContentResponse()
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async deleteEvent(@Param('id') id: string, @Req() req: CustomRequest) {
    return await this.eventsService.deleteEvent(req, id);
  }
}

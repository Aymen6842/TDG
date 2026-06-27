import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  Get,
  Req,
  UseGuards,
  Put,
  ParseArrayPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  UploadedFile,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationTokenDto } from '../dto/request/post/create-notification-token.dto';
import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  InvalidDataOrFcmSendErrorApiResponse,
  NotificationNotFoundApiResponse,
  UserNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import {
  ApiBody,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateNotificationDto } from '../dto/request/post/create-notification.dto';
import { FilterNotificationsParameters } from '../types/request.type';
import { CustomRequest } from 'src/common/types/request.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadStorage } from 'src/common/upload/upload.storage';
import { CreatedNotificationTokenDto } from '../dto/response/post/created-notification-token.dto';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { PaginateSentNotificationsDto } from '../dto/response/fetch/paginate-notifications-sent.dto';
import { PaginateReceivedNotificationsDto } from '../dto/response/fetch/paginate-received-notifications.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Put('token')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.NOTIFICATIONS.NOTIFICATION_TOKEN_CREATE])
  @ApiOperation({
    summary: 'Create or update a token to receive notifications',
  })
  @ApiBody({
    type: CreateNotificationTokenDto,
    description:
      'Contains the notification token data to register, in case of guest user, userId is not required. If the user is authenticated after registering the token, you can update the userId by sending the token again with the userId.',
  })
  @ApiOkResponse({
    type: CreatedNotificationTokenDto,
    description: 'Create notificationToken is successful',
  })
  @ApiOperation({ description: 'Register a notificationToken' })
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedNotificationTokenDto })
  createOrUpdateNotificationToken(
    @Req() req: CustomRequest,
    @Body() createNotificationTokenDto: CreateNotificationTokenDto,
  ) {
    return this.notificationsService.createOrUpdateNotificationToken(
      req,
      createNotificationTokenDto,
    );
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.NOTIFICATIONS.NOTIFICATION_CREATE])
  @ApiOperation({ summary: 'Create and send notifications to users' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token of the admin or the content manager',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: CreateNotificationDto,
    description:
      'Contains the notification data to send to users, including title and body. usersIds or sendToAllUsers is required, you cannot do not provide both of them, if sendToAllUsers is true, the notification will be sent to all users.',
  })
  @ApiNoContentResponse({ description: 'Notification sent successfully' })
  @ApiResponse(InvalidDataOrFcmSendErrorApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileInterceptor('image', UploadStorage.NotificationImageConfig()),
  )
  createNotification(
    @Req() req: CustomRequest,
    @Body() inputDataNotificationDto: CreateNotificationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.notificationsService.createNotification(
      req,
      inputDataNotificationDto,
      file,
    );
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.NOTIFICATIONS.NOTIFICATION_UPDATE])
  @ApiOperation({ summary: 'Mark a notification as seen by its ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'notificationIds',
    description: 'The IDs of the notifications to be marked as seen',
    required: true,
    example: 'notification-1234-id,notification-5678-id',
  })
  @ApiBody({
    description: 'Mark notification as seen, no body is required.',
  })
  @ApiNoContentResponse({ description: 'The update of isSeen is successful' })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(NotificationNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateNotificationForUser(
    @Query(
      'notificationIds',
      new ParseArrayPipe({ items: String, separator: ',' }),
    )
    notificationIds: string[],
    @Req() req: CustomRequest,
  ) {
    return this.notificationsService.updateNotificationForUser(
      req,
      notificationIds,
    );
  }

  @Get('sent')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.NOTIFICATIONS.NOTIFICATION_READ_FOR_SENDER])
  @ApiOperation({ summary: 'Fetch notifications for the sender' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token of the admin or the content manager',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the notifications',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the notifications returned',
    required: false,
    example: '5',
  })
  @ApiOkResponse({
    type: PaginateSentNotificationsDto,
    description: 'Fetch notifications successfully',
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateSentNotificationsDto })
  filterNotificationsForSender(
    @Req() req: CustomRequest,
    @Query() query: FilterNotificationsParameters,
  ) {
    return this.notificationsService.filterNotificationsForSender(req, query);
  }

  @Get('received')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.NOTIFICATIONS.NOTIFICATION_READ_FOR_RECEIVER])
  @ApiOperation({
    summary: 'Fetch notifications for the authenticated user for the website',
  })
  @ApiQuery({
    name: 'isSeen',
    description: 'Filter notifications by seen status',
    required: false,
    example: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the notifications',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the notifications returned',
    required: false,
    example: '5',
  })
  @ApiOkResponse({
    type: PaginateReceivedNotificationsDto,
    description: 'Fetch notifications successfully',
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateReceivedNotificationsDto })
  filterNotificationsForUser(
    @Query() query: FilterNotificationsParameters,
    @Req() req: CustomRequest,
  ) {
    return this.notificationsService.filterNotificationsForUser(req, query);
  }

  @Delete(':id')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.NOTIFICATIONS.NOTIFICATION_DELETE])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ description: 'Delete a notification by its ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token of the admin or the content manager',
    required: true,
    example: 'Bearer token',
  })
  @ApiNoContentResponse({ description: 'Notification deleted successfully' })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(NotificationNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async deleteNotificationById(
    @Req() req: CustomRequest,
    @Param('id') id: string,
  ) {
    return await this.notificationsService.deleteNotificationById(req, id);
  }
}

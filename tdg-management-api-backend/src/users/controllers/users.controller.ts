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
  Res,
  UploadedFiles,
  Param,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CustomRequest } from 'src/common/types/request.type';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  InvalidDataOrUserAlreadyExistApiResponse,
  ForbiddenApiResponse,
  InternalServerErrorApiResponse,
  RequestUpdatePasswordBadRequestApiResponse,
  UserNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import { SortUserBy } from '../types/request.type';
import { UserType } from '@prisma/client';
import { Response } from 'express';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { UploadStorage } from 'src/common/upload/upload.storage';
import { FilterUsersDto } from '../dto/request/fetch/filter-users-parameters.dto';
import { UserDetailsForManagerDto } from '../dto/response/fetch/user-details-for-manager.dto';
import { CreateUserByAdminDto } from '../dto/request/post/create-user-by-admin';
import { CreatedUserByAdminDto } from '../dto/response/post/created-user-by-admin.dto';
import { RolesDto } from '../dto/response/fetch/roles.dto';
import { PaginateUsersDto } from '../dto/response/fetch/paginate-users.dto';
import { UpdatePasswordDto } from '../dto/request/update/update-password.dto';
import { UpdatedUserDto } from '../dto/response/update/updated-user.dto';
import { UpdateOwnDetailsDto } from '../dto/request/update/update-own-details.dto';
import { UpdateUserDetailsByAdminDto } from '../dto/request/update/update-user-details-by-admin.dto';
import { SendEmailsDto } from '../dto/request/post/send-emails.dto';
import { EmailSentDto } from '../dto/response/post/email-sent.dto';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Permissions([PERMISSIONS.USERS.USER_CREATE_BY_ADMIN])
  @UseGuards(HasPermissionGuard)
  @ApiBody({ type: CreateUserByAdminDto })
  @ApiCreatedResponse({
    description: 'Success Registration!',
    type: CreatedUserByAdminDto,
  })
  @ApiResponse(InvalidDataOrUserAlreadyExistApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileInterceptor('image', UploadStorage.UserImageConfig()),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: CreatedUserByAdminDto })
  createUserAccountByAdmin(
    @Request() req: CustomRequest,
    @Body() data: CreateUserByAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.createUserAccountByAdmin(req, file, data);
  }

  @Get('me')
  @Permissions([PERMISSIONS.USERS.USER_READ_OWN])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({ type: UserDetailsForManagerDto })
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UserDetailsForManagerDto })
  async getUserDetails(@Request() req: CustomRequest) {
    return await this.usersService.getUserDetails(req);
  }

  @Get('roles')
  @Permissions([PERMISSIONS.USERS.ROLE_READ])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'List of available roles',
    type: RolesDto,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: RolesDto })
  fetchRoles(@Request() req: CustomRequest) {
    return this.usersService.fetchRoles(req);
  }

  @Get()
  @Permissions([PERMISSIONS.USERS.USER_READ_MANY_BY_MANAGER])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the users',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the users returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'email',
    description: 'Filtering the users by email',
    required: false,
    example: 'mohamedawedi@tawer.tn',
  })
  @ApiQuery({
    name: 'name',
    description: 'Filtering the users by name',
    required: false,
    example: 'mohamed awedi',
  })
  @ApiQuery({
    name: 'phone',
    description: 'Filtering the users by phone',
    required: false,
    example: '+1234567890',
  })
  @ApiQuery({
    name: 'teamsIds',
    description: 'Filtering the users by teams IDs',
    required: false,
    example: '1,2,3',
  })
  @ApiQuery({
    name: 'usersIds',
    description: 'Filtering the users by users IDs',
    required: false,
    example: '1,2,3',
  })
  @ApiProperty({
    name: 'roles',
    description: 'Filtering the users by role',
    required: false,
    example: 'TawerDevProjectManager,TawerCreativeManager',
    enum: UserType,
  })
  @ApiQuery({
    name: 'userCreatedAtFrom',
    description: 'Filtering the users created from a specific date (UTC)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'userCreatedAtTo',
    description: 'Filtering the users created to a specific date (UTC)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'sortBy',
    description: `Sorting the users by one of the following options:
    - emailAsc: Sort by email in ascending order (A-Z)
    - emailDesc: Sort by email in descending order (Z-A)
    - nameAsc: Sort by name in ascending order (A-Z)
    - nameDesc: Sort by name in descending order (Z-A)
    - createdAtAsc: Sort by creation date in ascending order (oldest to newest)
    - createdAtDesc: Sort by creation date in descending order (newest to oldest)
    If not specified, the default sorting is by createdAtDesc.
    `,
    required: false,
    enum: SortUserBy,
    example: 'createdAtDesc',
  })
  @ApiOkResponse({ type: PaginateUsersDto })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateUsersDto })
  async filterUsers(
    @Request() req: CustomRequest,
    @Query() query: FilterUsersDto,
  ) {
    return await this.usersService.filterUsers(req, query);
  }

  @Get('csv')
  @Permissions([PERMISSIONS.USERS.USER_READ_MANY_BY_MANAGER])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the users',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the users returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'email',
    description: 'Filtering the users by email',
    required: false,
    example: 'mohamedawedi@tawer.tn',
  })
  @ApiQuery({
    name: 'name',
    description: 'Filtering the users by name',
    required: false,
    example: 'mohamed awedi',
  })
  @ApiQuery({
    name: 'phone',
    description: 'Filtering the users by phone',
    required: false,
    example: '+1234567890',
  })
  @ApiQuery({
    name: 'teamsIds',
    description: 'Filtering the users by teams IDs',
    required: false,
    example: '1,2,3',
  })
  @ApiQuery({
    name: 'usersIds',
    description: 'Filtering the users by users IDs',
    required: false,
    example: '1,2,3',
  })
  @ApiProperty({
    name: 'roles',
    description: 'Filtering the users by role',
    required: false,
    example: 'TawerDevProjectManager,TawerCreativeManager',
    enum: UserType,
  })
  @ApiQuery({
    name: 'userCreatedAtFrom',
    description: 'Filtering the users created from a specific date (UTC)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'userCreatedAtTo',
    description: 'Filtering the users created to a specific date (UTC)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'sortBy',
    description: `Sorting the users by one of the following options:
    - emailAsc: Sort by email in ascending order (A-Z)
    - emailDesc: Sort by email in descending order (Z-A)
    - nameAsc: Sort by name in ascending order (A-Z)
    - nameDesc: Sort by name in descending order (Z-A)
    - createdAtAsc: Sort by creation date in ascending order (oldest to newest)
    - createdAtDesc: Sort by creation date in descending order (newest to oldest)
    If not specified, the default sorting is by createdAtDesc.
    `,
    required: false,
    enum: SortUserBy,
    example: 'createdAtDesc',
  })
  @ApiResponse(ForbiddenApiResponse)
  async filterUsersAndReturnOnCsv(
    @Request() req: CustomRequest,
    @Query() query: FilterUsersDto,
    @Res() res: Response,
  ) {
    return await this.usersService.filterUsersAndReturnOnCsv(req, query, res);
  }

  @Patch('password/me')
  @Permissions([PERMISSIONS.USERS.USER_UPDATE_PASSWORD_SELF])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({ description: 'Updating password schema', type: UpdatePasswordDto })
  @ApiOkResponse({ type: UpdatedUserDto })
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(RequestUpdatePasswordBadRequestApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedUserDto })
  async updateUserPassword(
    @Request() req: CustomRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updateUserPassword(req, updatePasswordDto);
  }

  @Patch('me')
  @Permissions([PERMISSIONS.USERS.USER_UPDATE_SELF])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({ type: UpdatedUserDto })
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileInterceptor('image', UploadStorage.UserImageConfig()),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: UpdatedUserDto })
  async updateOwnDetails(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateOwnDetailsDto: UpdateOwnDetailsDto,
  ) {
    return this.usersService.updateOwnDetails(req, file, updateOwnDetailsDto);
  }

  @Patch(':id')
  @Permissions([PERMISSIONS.USERS.USER_UPDATE_BY_MANAGER])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({ type: UpdateUserDetailsByAdminDto })
  @ApiOkResponse({ type: UpdatedUserDto })
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InvalidDataOrUserAlreadyExistApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileInterceptor('image', UploadStorage.UserImageConfig()),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: UpdatedUserDto })
  async updateUserDetailsByAdmin(
    @Request() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateUserDetailsByAdminDto: UpdateUserDetailsByAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateUserDetailsByAdmin(
      req,
      id,
      file,
      updateUserDetailsByAdminDto,
    );
  }

  @Post('emails')
  @Permissions([PERMISSIONS.USERS.EMAIL_SEND])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({ type: SendEmailsDto })
  @ApiOkResponse({
    description: 'Emails sent successfully',
    type: EmailSentDto,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 50 }],
      UploadStorage.AttachementStorage(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: EmailSentDto })
  async sendEmailToUsers(
    @Request() req: CustomRequest,
    @Body() sendEmailsDto: SendEmailsDto,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    return this.usersService.sendEmailsToUsers(req, sendEmailsDto, attachments);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions([PERMISSIONS.USERS.USER_DELETE])
  @UseGuards(HasPermissionGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
    example: 'Bearer token123',
  })
  @ApiNoContentResponse()
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async deleteUserByAdmin(
    @Request() req: CustomRequest,
    @Param('id') id: string,
  ) {
    return await this.usersService.deleteUserByAdmin(req, id);
  }
}

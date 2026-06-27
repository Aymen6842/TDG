import { HttpException, Injectable } from '@nestjs/common';
import { BcryptService } from 'src/common/bcrypt/service/bcrypt.service';
import { NotFoundCustomException } from '../../common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from '../../common/exceptions/error-codes/error.code';
import { BadRequestCustomException } from '../../common/exceptions/custom-exceptions/bad-request.exception';
import { FetchUserRepository } from '../repositories/fetch-user.repository';
import { UpdateUserRepository } from '../repositories/update-user-repository';
import { DeleteUserRepository } from '../repositories/delete-user.repository';
import { Prisma, UserType } from '@prisma/client';
import { CustomRequest } from 'src/common/types/request.type';
import { MailService } from 'src/common/mail/service/mail.service';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Parser } from 'json2csv';
import { Response } from 'express';
import { FilterUsersDto } from '../dto/request/fetch/filter-users-parameters.dto';
import { PaginationParametersRequestDto } from '../dto/request/fetch/pagination-parameters.dto';
import { UpdateUserDetailsByAdminDto } from '../dto/request/update/update-user-details-by-admin.dto';
import { UploadService } from 'src/common/upload/service/upload.service';
import { UpdateOwnDetailsDto } from '../dto/request/update/update-own-details.dto';
import { UpdatePasswordDto } from '../dto/request/update/update-password.dto';
import { CreateUserByAdminDto } from '../dto/request/post/create-user-by-admin';
import { CreateUserRepository } from '../repositories/create-user-repository';
import { ErrorLoggerService } from 'src/common/logger/error-logger/error-logger.service';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { SendEmailsDto } from '../dto/request/post/send-emails.dto';
import { SlugifyService } from 'src/common/slugify/service/slugify.service';
import { UserSummaryForManagerInCsvDto } from '../dto/response/fetch/user-summary-for-manager-in-csv.dto';
import { PermissionsService } from 'src/auths/services/permissions/permissions.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserRepository: CreateUserRepository,
    private readonly fetchUserRepository: FetchUserRepository,
    private readonly updateUserRepository: UpdateUserRepository,
    private readonly deleteUserRepository: DeleteUserRepository,
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
    private readonly bcryptService: BcryptService,
    private readonly logger: ErrorLoggerService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async createUserAccountByAdmin(
    req: CustomRequest,
    file: Express.Multer.File | undefined,
    data: CreateUserByAdminDto,
  ) {
    try {
      const permission = this.permissionsService.canRolesManageRoles(
        req.user?.roles as UserType[],
        data.roles,
      );
      if (!permission) throw new ForbiddenCustomException();

      if (!file?.filename)
        throw new BadRequestCustomException(
          'User image is required!',
          ErrorCode.INVALID_DATA,
        );

      data.hashedPassword = await this.bcryptService.hash(data.password);
      data.image = this.uploadService.setImagePathForUser(file.filename);
      data.unaccentedName = SlugifyService.toUnaccented(data.name);

      const user = await this.createUserRepository.createUserByAdmin(data);

      // Sending an email for confirmation
      this.mailService.sendHtmlEmail({
        to: [user.email],
        subject: 'Welcome to TDG Management!',
        toName: user.name,
        paragraphs: [
          'Welcome to TDG Management!</br>We are excited to have you on board!</br>If you have any questions or need assistance, feel free to reach out to our support team.</br>Thank you for joining us.',
        ],
      });

      return user;
    } catch (error: unknown) {
      if (file) this.uploadService.deleteImageByPath(file.path);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new BadRequestCustomException(
          'This user already exists!',
          ErrorCode.USER_ALREADY_EXIST,
        );

      throw error;
    }
  }

  async sendEmailsToUsers(
    req: CustomRequest,
    data: SendEmailsDto,
    attachments: Express.Multer.File[],
  ) {
    const users = data.isAllUsers
      ? await this.fetchUserRepository.getAllEmails()
      : await this.fetchUserRepository.getEmailsByEmails(data.emails || []);
    const emails = users.map((user) => user.email);

    await this.mailService.sendHtmlEmail({
      to: emails,
      cc: data.cc ?? [],
      bcc: data.bcc ?? [],
      subject: data.subject,
      toName: 'All',
      paragraphs: [data.text],
      attachments,
    });

    return {
      emails,
      cc: data.cc ?? [],
      bcc: data.bcc ?? [],
      subject: data.subject,
      text: data.text,
    };
  }

  async getUserDetails(req: CustomRequest) {
    const [user] = await this.fetchUserRepository.getUserDetailsById(
      req.user?.id as string,
    );
    if (!user)
      throw new NotFoundCustomException(
        'This user is not found!',
        ErrorCode.USER_NOT_FOUND,
      );

    return user;
  }

  fetchRoles(req: CustomRequest) {
    return this.permissionsService.getManageableRolesFromRequest(req);
  }

  async filterUsers(req: CustomRequest, query: FilterUsersDto) {
    const { page, limit } = this.retrievePaginationParameters(query);

    // checking the permissions
    if (query.roles && query.roles.length > 0) {
      const permission = this.permissionsService.canRolesManageRoles(
        req.user?.roles as UserType[],
        query.roles,
      );
      if (!permission) throw new ForbiddenCustomException();
    } else {
      query.roles = this.permissionsService.getManageableRolesFromRequest(req);
      if (query.roles.length === 0) throw new ForbiddenCustomException();
    }

    // retrieving the users using pagination
    const countedUsersFromDb = await this.fetchUserRepository.countUsers(query);
    const countedUsers = countedUsersFromDb[0]?.countedUsers;
    const skip = (page - 1) * limit;
    const users = await this.fetchUserRepository.filterUsers(
      query,
      skip,
      limit,
    );

    const paginationParameters = this.setPaginationParametersInResponse(
      countedUsers,
      page,
      limit,
    );

    return { data: users, pagination: paginationParameters };
  }

  async filterUsersAndReturnOnCsv(
    req: CustomRequest,
    query: FilterUsersDto,
    res: Response,
  ) {
    // checking the permissions
    if (query.roles && query.roles.length > 0) {
      const permission = this.permissionsService.canRolesManageRoles(
        req.user?.roles as UserType[],
        query.roles,
      );
      if (!permission) throw new ForbiddenCustomException();
    } else
      query.roles = this.permissionsService.getManageableRolesFromRequest(req);

    // retrieving the users
    const users = await this.fetchUserRepository.filterUsers(query);
    const usersDtoInstance = plainToInstance(
      UserSummaryForManagerInCsvDto,
      users,
    );
    const transformedUsers = instanceToPlain(usersDtoInstance);

    const csvParser = new Parser({
      fields: [
        { label: 'ID', value: 'id' },
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
        { label: 'Roles', value: 'roles' },
        { label: 'Teams', value: 'teams' },
        { label: 'Time Worked (in minutes)', value: 'timeWorkedInMinutes' },
        {
          label: 'Average Session Time (in minutes)',
          value: 'averageSessionTimeInMinutes',
        },
        {
          label: 'Average Performance Rating',
          value: 'averagePerformanceRating',
        },
        {
          label: 'Average Daily Mood',
          value: 'averageDailyMood',
        },
        { label: 'Created At', value: 'createdAt' },
        { label: 'Updated At', value: 'updatedAt' },
      ],
      withBOM: true,
    });
    const csv = csvParser.parse(transformedUsers);

    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.attachment('users.csv');
    res.status(200).send(csv);
  }

  async updateUserDetailsByAdmin(
    req: CustomRequest,
    userId: string,
    file: Express.Multer.File | undefined,
    data: UpdateUserDetailsByAdminDto,
  ) {
    try {
      const permission = this.permissionsService.canRolesManageRoles(
        req.user?.roles as UserType[],
        data?.roles || [],
      );
      if (!permission) throw new ForbiddenCustomException();

      if (data?.name)
        data.unaccentedName = SlugifyService.toUnaccented(data.name);

      if (file?.filename) {
        const [user] = await this.fetchUserRepository.getUserDetailsById(
          req.user?.id as string,
        );
        if (!user)
          throw new NotFoundCustomException(
            'This user is not found!',
            ErrorCode.USER_NOT_FOUND,
          );

        data.image = this.uploadService.setImagePathForUser(file.filename);

        const updatedUser =
          await this.updateUserRepository.updateUserDetailsByAdmin(
            userId,
            data,
          );

        // Deleting old image if exists and new image is uploaded
        if (user.image) {
          this.uploadService.deleteImageByPathInDb(user.image);
        }

        return updatedUser;
      }

      const updatedUser =
        await this.updateUserRepository.updateUserDetailsByAdmin(userId, data);

      return updatedUser;
    } catch (error: unknown) {
      if (file?.filename) this.uploadService.deleteImageByPath(file.path);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );
      else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new BadRequestCustomException(
          'This user already exists!',
          ErrorCode.USER_ALREADY_EXIST,
        );

      throw error;
    }
  }

  getUserWithNotificationsSettingsById(userId: string) {
    return this.fetchUserRepository.getUserWithNotificationsSettingsById(
      userId,
    );
  }

  async getUsersWithNotificationsSettings() {
    return await this.fetchUserRepository.getAllUsersWithNotificationsSettings();
  }

  async getUsersWithNotificationsSettingsByRoles(roles: UserType[]) {
    return await this.fetchUserRepository.getUsersWithNotificationsSettingsByRoles(
      roles,
    );
  }

  async getAllEmails() {
    const users = await this.fetchUserRepository.getAllEmails();
    return users.map((user) => user.email);
  }

  async updateOwnDetails(
    req: CustomRequest,
    file: Express.Multer.File | undefined,
    data: UpdateOwnDetailsDto,
  ) {
    try {
      if (data?.name)
        data.unaccentedName = SlugifyService.toUnaccented(data.name);

      if (file?.filename) {
        const [user] = await this.fetchUserRepository.getUserDetailsById(
          req.user?.id as string,
        );
        if (!user)
          throw new NotFoundCustomException(
            'This user is not found!',
            ErrorCode.USER_NOT_FOUND,
          );
        data.image = this.uploadService.setImagePathForUser(file.filename);

        const updatedUser = await this.updateUserRepository.updateOwnDetails(
          req.user?.id as string,
          data,
        );

        // Deleting old image if exists and new image is uploaded
        if (user.image) {
          this.uploadService.deleteImageByPathInDb(user.image);
        }

        return updatedUser;
      }

      const updatedUser = await this.updateUserRepository.updateOwnDetails(
        req.user?.id as string,
        data,
      );

      return updatedUser;
    } catch (error: unknown) {
      if (file?.filename) this.uploadService.deleteImageByPath(file.path);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );

      throw error;
    }
  }

  async updateUserPassword(
    req: CustomRequest,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      const id = req.user?.id as string;
      const user = await this.fetchUserRepository.getUserPassword(id);
      if (!user)
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );

      // checking the password
      const userPassword = user.password;
      const access = await this.bcryptService.compare(
        updatePasswordDto.oldPassword,
        userPassword,
      );
      if (!access)
        throw new BadRequestCustomException(
          'Invalid Password!',
          ErrorCode.INVALID_PASSWORD,
        );

      // Updating the password
      const hash = await this.bcryptService.hash(updatePasswordDto.newPassword);
      const updatedUser = await this.updateUserRepository.updateUserPassword(
        id,
        hash,
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw error;
    }
  }

  async getAllUsersForEvent() {
    return this.fetchUserRepository.getAllUsersForEvent();
  }

  async deleteUserByAdmin(req: CustomRequest, userId: string) {
    try {
      const [user] = await this.fetchUserRepository.getUserDetailsById(
        req.user?.id as string,
      );
      if (!user)
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );

      const permission = this.permissionsService.canRolesManageRoles(
        req.user?.roles as UserType[],
        user?.roles?.map((role) => role.type),
      );
      if (!permission) throw new ForbiddenCustomException();

      await this.updateUserRepository.updateUserDetailsByAdmin(userId, {
        isActive: false,
      } as UpdateUserDetailsByAdminDto);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );

      throw error;
    }
  }

  setPaginationParametersInResponse(
    totalUsers: number,
    page: number,
    limit: number,
  ) {
    const totalPagesFloat = totalUsers / limit;
    const totalPages =
      totalPagesFloat - Math.trunc(totalPagesFloat) > 0
        ? Math.trunc(totalPagesFloat) + 1
        : totalPagesFloat;

    return {
      records: totalUsers,
      currentPage: page,
      totalPages: totalPages,
    };
  }

  retrievePaginationParameters(query: PaginationParametersRequestDto): {
    page: number;
    limit: number;
  } {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 500, 500);

    return { page, limit };
  }
}

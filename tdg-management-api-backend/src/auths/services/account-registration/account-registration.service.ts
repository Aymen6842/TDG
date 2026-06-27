import { Injectable } from '@nestjs/common';
import { BcryptService } from 'src/common/bcrypt/service/bcrypt.service';
import { AccountRegistrationRepository } from '../../repositories/registration.repository';
import { MailService } from 'src/common/mail/service/mail.service';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { Prisma } from '@prisma/client';
import { CustomRequest } from 'src/common/types/request.type';
import { CreateUserAccountDto } from 'src/auths/dto/request/post/create-user-account.dto';
import { ErrorLoggerService } from 'src/common/logger/error-logger/error-logger.service';
import { UploadService } from 'src/common/upload/service/upload.service';
import { SlugifyService } from 'src/common/slugify/service/slugify.service';

@Injectable()
export class AccountRegistrationService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly accountRegistrationRepository: AccountRegistrationRepository,
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
    private readonly logger: ErrorLoggerService,
  ) {}

  async createUserAccount(
    req: CustomRequest,
    file: Express.Multer.File | undefined,
    data: CreateUserAccountDto,
  ) {
    try {
      if (!file?.filename)
        throw new BadRequestCustomException(
          'User image is required!',
          ErrorCode.INVALID_DATA,
        );

      data.hashedPassword = await this.bcryptService.hash(data.password);
      data.image = this.uploadService.setImagePathForUser(file.filename);
      data.unaccentedName = SlugifyService.toUnaccented(data.name);

      const user =
        await this.accountRegistrationRepository.createUserAccount(data);

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
}

import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import { ResetPasswordRepository } from '../../repositories/reset-password.repository';
import {
  RequestResetPasswordDto,
  VerificationResetPasswordDto,
  ResetPasswordDto,
} from '../../dto/request/post/reset-password.dto';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { BcryptService } from 'src/common/bcrypt/service/bcrypt.service';
import { MailService } from 'src/common/mail/service/mail.service';
import { TimeService } from 'src/common/time/service/time.service';
import { CustomRequest } from 'src/common/types/request.type';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly resetPasswordRepository: ResetPasswordRepository,
    private readonly mailService: MailService,
  ) {}

  async generateResetCode(
    req: CustomRequest,
    requestResetPassowrdDto: RequestResetPasswordDto,
  ) {
    const email = requestResetPassowrdDto.email;

    const user = // Checking the existance of the user
      await this.resetPasswordRepository.retrieveUserForResetByEmail(email);
    if (!user)
      throw new NotFoundCustomException(
        'This user is not found!',
        ErrorCode.USER_NOT_FOUND,
      );

    // generating a code
    const code = this.generateCode(5);
    const expiredAt = TimeService.getExpirationTimeForResetPasswordCode();
    await this.resetPasswordRepository.createResetPasswordCode(
      user.id,
      code,
      expiredAt,
    );
    this.mailService.sendHtmlEmail({
      to: [email],
      subject: 'Password Reset Code',
      toName: user.name,
      paragraphs: [
        `Your password reset code is: ${code}. This code will expire in 15 minutes.<br/>If you did not request a password reset, please ignore this email.`,
      ],
    });
  }

  async verifyResetCode(
    req: CustomRequest,
    verificationResetPasswordDto: VerificationResetPasswordDto,
  ) {
    const email = verificationResetPasswordDto.email;
    const code = verificationResetPasswordDto.code;

    const user = // Checking the existance of the user
      await this.resetPasswordRepository.retrieveUserWithResetPasswordCodeByEmail(
        email,
      );
    if (!user)
      throw new NotFoundCustomException(
        'This user is not found!',
        ErrorCode.USER_NOT_FOUND,
      );

    if (
      // Checking the validity of the code
      !user?.resetPasswordCode?.code ||
      user.resetPasswordCode?.code !== code ||
      TimeService.isBeforeCurrentUTCTime(user.resetPasswordCode.expiredAt)
    )
      throw new BadRequestCustomException(
        'Invalid Reset Code!',
        ErrorCode.INVALID_RESET_CODE,
      );
  }

  async resetPassword(req: CustomRequest, resetPassowrdDto: ResetPasswordDto) {
    const email = resetPassowrdDto.email;
    const code = resetPassowrdDto.code;
    const password = resetPassowrdDto.password;

    const user = // Checking the existance of the user
      await this.resetPasswordRepository.retrieveUserWithResetPasswordCodeByEmail(
        email,
      );
    if (!user)
      throw new NotFoundCustomException(
        'This user is not found!',
        ErrorCode.USER_NOT_FOUND,
      );

    if (
      // Checking the validity of the code
      !user?.resetPasswordCode?.code ||
      user.resetPasswordCode?.code !== code ||
      TimeService.isBeforeCurrentUTCTime(user.resetPasswordCode.expiredAt)
    )
      throw new BadRequestException('This code is invalid!');

    // updating teh password
    const hash = await this.bcryptService.hash(password);
    await this.resetPasswordRepository.updatePassword(user.id, hash);
  }

  generateCode(digits: number) {
    let code = '';
    for (let i = 0; i < digits; i++)
      code = code + Math.floor(Math.random() * 10);
    return code;
  }
}

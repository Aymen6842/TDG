import { Injectable } from '@nestjs/common';

import { LogoutRepository } from '../../repositories/logout.repository';
import { LogoutDto } from '../../dto/request/post/logout.dto';
import { TokensService } from 'src/tokens/service/tokens.service';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { Prisma } from '@prisma/client';
import { CustomRequest } from 'src/common/types/request.type';

@Injectable()
export class LogoutService {
  constructor(
    private readonly logoutRepository: LogoutRepository,
    private readonly tokensService: TokensService,
  ) {}

  async logout(req: CustomRequest, logoutDto: LogoutDto) {
    try {
      const token = logoutDto.token; // retrieving the refresh token

      // decoding the token
      const user = this.tokensService.decodeAuthenticationToken(token);

      // deleting the refresh token from the db
      await this.logoutRepository.deleteRefreshToken(user.id, token);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new BadRequestCustomException(
          'This user is not logged!',
          ErrorCode.ACCOUNT_CREATED_VIA_ANOTHER_METHOD,
        );

      throw error;
    }
  }
}

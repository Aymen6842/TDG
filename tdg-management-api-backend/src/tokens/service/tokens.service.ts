import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { TokenDto } from '../dto/request/token.dto';
import { UnauthorizedCustomException } from '../../common/exceptions/custom-exceptions/unauthorized.exception';
import { ErrorCode } from '../../common/exceptions/error-codes/error.code';
import { BadRequestCustomException } from '../../common/exceptions/custom-exceptions/bad-request.exception';
import { ConfigService } from '@nestjs/config';
import {
  AccessToken,
  ExpirationTimeFormat,
  JwtPayloadForAuthentication,
  RefreshAccessTokens,
} from '../types/tokens.type';

@Injectable()
export class TokensService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  generateAuthenticationToken(
    id: string,
    roles: UserType[],
    teamsIds: string[],
    type: 'access' | 'refresh',
    expiresIn: `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'}`,
  ): string {
    return this.jwtService.sign({ id, roles, teamsIds, type }, { expiresIn });
  }

  generateAccessAndRefresh(
    id: string,
    roles: UserType[],
    teamsIds: string[],
  ): RefreshAccessTokens {
    const access = this.generateAuthenticationToken(
      id,
      roles,
      teamsIds,
      'access',
      this.configService.get('ACCESS_TOKEN_EXPIRATION') as ExpirationTimeFormat,
    ); // generating the access token
    const refresh = this.generateAuthenticationToken(
      id,
      roles,
      teamsIds,
      'refresh',
      this.configService.get(
        'REFRESH_TOKEN_EXPIRATION',
      ) as ExpirationTimeFormat,
    ); // generating the refresh token

    return { access, refresh };
  }

  // regenerating the access token using the refresh token
  async refreshAccessToken(tokenDto: TokenDto): Promise<AccessToken> {
    const payload = this.verifyAuthenticationTokenAndReturnPayload(
      tokenDto.token,
    );

    // Checking if the refresh token already exists
    const numberOfTokens = await this.refreshTokenRepository.countRefreshToken(
      tokenDto.token,
    );
    if (numberOfTokens === 0)
      throw new BadRequestCustomException(
        'Invalid Token!',
        ErrorCode.INVALID_JWT,
      );

    const access = this.generateAuthenticationToken(
      payload.id,
      payload.roles,
      payload.teamsIds,
      'access',
      this.configService.get('ACCESS_TOKEN_EXPIRATION') as ExpirationTimeFormat,
    );
    return { access };
  }

  verifyToken(tokenDto: TokenDto): void {
    try {
      this.jwtService.verify(tokenDto.token);
    } catch {
      throw new UnauthorizedCustomException();
    }
  }

  verifyAuthenticationTokenAndReturnPayload(
    token: string,
  ): JwtPayloadForAuthentication {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedCustomException();
    }
  }

  decodeAuthenticationToken(token: string): JwtPayloadForAuthentication {
    const payload: JwtPayloadForAuthentication = this.jwtService.decode(token);

    if (!payload || !payload.id)
      throw new BadRequestCustomException(
        'Invalid Token!',
        ErrorCode.INVALID_JWT,
      );

    return payload;
  }
}

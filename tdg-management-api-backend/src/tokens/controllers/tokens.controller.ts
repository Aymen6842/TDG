import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TokensService } from '../service/tokens.service';
import { TokenDto } from '../dto/request/token.dto';
import { ApiBody, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  RefreshTokenBadRequestApiResponse,
  UnauthorizedApiResponse,
} from '../swagger-documentation/error-response';
import { AccessTokenDto } from '../dto/response/access-token.dto';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post('verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(UnauthorizedApiResponse)
  verify(@Body() tokenDto: TokenDto) {
    return this.tokensService.verifyToken(tokenDto);
  }

  @Post('refresh')
  @ApiBody({ description: 'refreshing access token', type: TokenDto })
  @ApiCreatedResponse({ type: AccessTokenDto, description: 'Refreshed token!' })
  @ApiResponse(RefreshTokenBadRequestApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async refresh(@Body() tokenDto: TokenDto) {
    return await this.tokensService.refreshAccessToken(tokenDto);
  }
}

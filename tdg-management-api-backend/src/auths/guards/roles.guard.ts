import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from 'src/tokens/service/tokens.service';
import { Roles } from '../decorators/roles.decorator';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { CustomRequest } from 'src/common/types/request.type';
import { UserType } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokensService: TokensService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler()) ?? [];
    const request: CustomRequest = context.switchToHttp().getRequest();

    if (!request.headers?.authorization && roles.length === 0) return true;

    // Verifying the token
    const token = request.headers?.authorization?.split('Bearer ')[1];
    const user = this.tokensService.verifyAuthenticationTokenAndReturnPayload(
      token as string,
    );
    request.user = user;

    if (
      roles.length > 0 &&
      !roles.some((role) => user.roles.includes(role as UserType))
    )
      throw new ForbiddenCustomException();

    return true;
  }
}

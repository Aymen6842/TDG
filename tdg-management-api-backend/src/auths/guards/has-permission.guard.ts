import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from 'src/tokens/service/tokens.service';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { UnauthorizedCustomException } from 'src/common/exceptions/custom-exceptions/unauthorized.exception';
import { CustomRequest } from 'src/common/types/request.type';
import { PERMISSIONS_FOR_ROLE } from 'src/common/constants/permissions';
import { Permissions } from '../decorators/permissions.decorator';

@Injectable()
export class HasPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokensService: TokensService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions =
      this.reflector.get(Permissions, context.getHandler()) ?? [];
    const request: CustomRequest = context.switchToHttp().getRequest();

    const hasAuthorization = !!request.headers?.authorization;

    // If no authorization header and permissions are required, throw 401
    if (!hasAuthorization && permissions.length > 0) {
      throw new UnauthorizedCustomException();
    }

    // If no authorization header and no permissions required, allow
    if (!hasAuthorization && permissions.length === 0) {
      return true;
    }

    // Verifying the token
    const token = request.headers?.authorization?.split('Bearer ')[1];

    // If token is missing but was expected, throw 401
    if (!token && permissions.length > 0) {
      throw new UnauthorizedCustomException();
    }

    const user = this.tokensService.verifyAuthenticationTokenAndReturnPayload(
      token as string,
    );
    request.user = user;

    if (
      permissions.length > 0 &&
      !permissions.some((permission) =>
        user.roles.some((role) =>
          PERMISSIONS_FOR_ROLE[role].includes(permission),
        ),
      )
    )
      throw new ForbiddenCustomException();

    return true;
  }
}

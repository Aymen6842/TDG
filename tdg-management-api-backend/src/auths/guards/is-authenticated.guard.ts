import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokensService } from 'src/tokens/service/tokens.service';
import { CustomRequest } from 'src/common/types/request.type';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  constructor(private readonly tokensService: TokensService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: CustomRequest = context.switchToHttp().getRequest();

    // Checking the cookies or the headers
    const token = request.cookies?.accessToken
      ? (request.cookies?.accessToken as string)
      : (request.headers?.authorization?.split('Bearer ')[1] as string);

    // Verifying the token
    const user =
      this.tokensService.verifyAuthenticationTokenAndReturnPayload(token);
    request.user = user;

    return true;
  }
}

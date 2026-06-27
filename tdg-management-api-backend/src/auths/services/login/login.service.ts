import { Injectable } from '@nestjs/common';
import { LoginUserDto } from '../../dto/request/post/login.dto';
import { LoginRepository } from '../../repositories/login.repository';
import { TokensService } from 'src/tokens/service/tokens.service';
import { BcryptService } from 'src/common/bcrypt/service/bcrypt.service';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { UnauthorizedCustomException } from 'src/common/exceptions/custom-exceptions/unauthorized.exception';
import { CustomRequest } from 'src/common/types/request.type';

@Injectable()
export class LoginService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly tokensService: TokensService,
    private readonly loginRepository: LoginRepository,
  ) {}

  async loginUser(req: CustomRequest, loginUserDto: LoginUserDto) {
    const user = await this.getUserByEmailOrPhoneForLogin(
      req,
      loginUserDto.email,
      loginUserDto.phone,
    );
    if (!user)
      throw new NotFoundCustomException(
        'This user is not found!',
        ErrorCode.USER_NOT_FOUND,
      );

    // checking if the password is correct
    const access = await this.bcryptService.compare(
      loginUserDto.password,
      user.password,
    );
    if (!access) throw new UnauthorizedCustomException();

    // returning the access and the refresh
    const tokens = this.tokensService.generateAccessAndRefresh(
      user.id,
      user?.roles?.map((role) => role.type),
      user?.teams?.map((team) => team.teamId),
    );

    await this.loginRepository.saveRefreshToken(user.id, tokens.refresh);

    return tokens;
  }

  async getUserByEmailOrPhoneForLogin(
    req: CustomRequest,
    email?: string,
    phone?: string,
  ) {
    if (email)
      return await this.loginRepository.retrieveDataForLoginByEmail(email);
    else if (phone)
      return await this.loginRepository.retrieveDataForLoginByPhone(phone);

    return null;
  }
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { LoginService } from '../services/login/login.service';
import { ResetPasswordService } from '../services/reset-password/reset-password.service';
import { LoginUserDto } from '../dto/request/post/login.dto';
import {
  RequestResetPasswordDto,
  ResetPasswordDto,
  VerificationResetPasswordDto,
} from '../dto/request/post/reset-password.dto';
import { LogoutService } from '../services/logout/logout.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import {
  AccountRegistrationBadRequestApiResponse,
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  InvalidDataOrUserNotLoggedApiResponse,
  RequestResetPasswordBadRequestApiResponse,
  UserNotFoundApiResponse,
  VerificationResetPasswordBadRequestApiResponse,
} from '../swagger-documentation/error-response';
import { LogoutDto } from '../dto/request/post/logout.dto';
import { UnauthorizedApiResponse } from 'src/tokens/swagger-documentation/error-response';
import { LoginResponseDto } from '../dto/response/post/login-response.dto';
import { CustomRequest } from 'src/common/types/request.type';
import { CreateUserAccountDto } from '../dto/request/post/create-user-account.dto';
import { AccountRegistrationService } from '../services/account-registration/account-registration.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadStorage } from 'src/common/upload/upload.storage';
import { CreatedUserDto } from '../dto/response/post/created-user.dto';
import { HasPermissionGuard } from '../guards/has-permission.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';

@Controller('auths')
export class AuthsController {
  constructor(
    private readonly loginService: LoginService,
    private readonly logoutService: LogoutService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly accountRegistrationService: AccountRegistrationService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserAccountDto })
  @ApiCreatedResponse({
    description: 'Success Registration!',
    type: CreatedUserDto,
  })
  @ApiResponse(AccountRegistrationBadRequestApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(
    FileInterceptor('image', UploadStorage.UserImageConfig()),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: CreatedUserDto })
  createUserAccount(
    @Request() req: CustomRequest,
    @Body() createUserAccountDto: CreateUserAccountDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.accountRegistrationService.createUserAccount(
      req,
      file,
      createUserAccountDto,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ description: 'Success Login!', type: LoginResponseDto })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  loginUser(@Request() req: CustomRequest, @Body() loginUserDto: LoginUserDto) {
    return this.loginService.loginUser(req, loginUserDto);
  }

  @Post('logout')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.AUTHS.AUTH_LOGOUT])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: LogoutDto, description: 'The refresh token for logout.' })
  @ApiNoContentResponse()
  @ApiResponse(InvalidDataOrUserNotLoggedApiResponse)
  @ApiResponse(UnauthorizedApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  logout(@Req() req: CustomRequest, @Body() logoutDto: LogoutDto) {
    return this.logoutService.logout(req, logoutDto);
  }

  @Post('request-reset-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: RequestResetPasswordDto })
  @ApiNoContentResponse()
  @ApiResponse(RequestResetPasswordBadRequestApiResponse)
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  requestResetCode(
    @Request() req: CustomRequest,
    @Body() requestResetPassowrdDto: RequestResetPasswordDto,
  ) {
    return this.resetPasswordService.generateResetCode(
      req,
      requestResetPassowrdDto,
    );
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: VerificationResetPasswordDto })
  @ApiNoContentResponse()
  @ApiResponse(VerificationResetPasswordBadRequestApiResponse)
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  verifyResetCode(
    @Request() req: CustomRequest,
    @Body() verificationResetPasswordDto: VerificationResetPasswordDto,
  ) {
    return this.resetPasswordService.verifyResetCode(
      req,
      verificationResetPasswordDto,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: ResetPasswordDto })
  @ApiNoContentResponse()
  @ApiResponse(VerificationResetPasswordBadRequestApiResponse)
  @ApiResponse(UserNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  resetPassowrd(
    @Request() req: CustomRequest,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.resetPasswordService.resetPassword(req, resetPasswordDto);
  }
}

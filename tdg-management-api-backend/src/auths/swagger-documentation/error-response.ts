import { GeneralErrorDto } from 'src/common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

// internal server error
export const InternalServerErrorApiResponse = {
  status: 500,
  description: 'Server Error!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Server Error!',
      value: {
        message: 'Server Error!',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      },
    },
  },
};

export const UserLoginViaSocialAccountBadRequestApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    invalidSocialAuthCode: {
      summary: 'The code provided is invalid!',
      value: {
        message: 'The code provided is invalid!',
        code: ErrorCode.INVALID_SOCIAL_AUTH_CODE,
      },
    },
    conflictMethod: {
      summary: 'This account already created via another method!',
      value: {
        message: 'This account already created via another method!',
        code: ErrorCode.ACCOUNT_CREATED_VIA_ANOTHER_METHOD,
      },
    },
  },
};

// The provided data is invalid
export const InvalidDataApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
  },
};

// The provided data is invalid or the user already logged
export const InvalidDataOrUserAlreadyLoggedApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    userAlreadyLogged: {
      summary: 'This user is already logged in!',
      value: {
        message: 'This user is already logged in!',
        code: ErrorCode.USER_ALREADY_LOGGED,
      },
    },
  },
};

// The provided data is invalid
export const InvalidDataOrInvalidJwtApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    invalidJwt: {
      summary: 'Invalid Token!',
      value: {
        message: 'Invalid Token!',
        code: ErrorCode.INVALID_JWT,
      },
    },
  },
};

// The provided data is invalid or the user is not logged
export const InvalidDataOrUserNotLoggedApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    userNotLogged: {
      summary: 'This user is not logged!',
      value: {
        message: 'This user is not logged!',
        code: ErrorCode.USER_NOT_LOGGED,
      },
    },
  },
};

// bad request in account registration with 2fa
export const AccountRegistrationUsing2FABadRequestApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    userAlreadyExists: {
      summary: 'This user already exists!',
      value: {
        message: 'This user already exists!',
        code: ErrorCode.USER_ALREADY_EXISTS,
      },
    },
    invalidTwoFactorAuthCode: {
      summary: 'The two factor authentication code is invalid or expired!',
      value: {
        message: 'The two factor authentication code is invalid or expired!',
        code: ErrorCode.INVALID_TWO_FACTOR_AUTH_CODE,
      },
    },
    exceededMaximumNumberOfAttemptsForTwoFactorAuth: {
      summary: 'Exceeded maximum number of attempts for two factor auth!',
      value: {
        message: 'Exceeded maximum number of attempts for two factor auth!',
        code: ErrorCode.EXCEEDED_MAXIMUM_NUMBER_OF_ATTEMPTS_FOR_TWO_FACTOR_AUTH,
      },
    },
  },
};

// bad request in account registration
export const AccountRegistrationBadRequestApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    userAlreadyExists: {
      summary: 'This user already exists!',
      value: {
        message: 'This user already exists!',
        code: ErrorCode.USER_ALREADY_EXISTS,
      },
    },
  },
};

// bad request in account registration
export const InvalidDataOrInvalid2FAAuthCodeApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    invalidTwoFactorAuthCode: {
      summary: 'The two factor authentication code is invalid or expired!',
      value: {
        message: 'The two factor authentication code is invalid or expired!',
        code: ErrorCode.INVALID_TWO_FACTOR_AUTH_CODE,
      },
    },
    exceededMaximumNumberOfAttemptsForTwoFactorAuth: {
      summary: 'Exceeded maximum number of attempts for two factor auth!',
      value: {
        message: 'Exceeded maximum number of attempts for two factor auth!',
        code: ErrorCode.EXCEEDED_MAXIMUM_NUMBER_OF_ATTEMPTS_FOR_TWO_FACTOR_AUTH,
      },
    },
  },
};

// user not found
export const UserNotFoundApiResponse = {
  status: 404,
  description: 'This user is not found!',
  type: GeneralErrorDto,
  examples: {
    userNotFound: {
      summary: 'This user is not found!',
      value: {
        message: 'This user is not found!',
        code: ErrorCode.USER_NOT_FOUND,
      },
    },
  },
};

// The reset password is impossible
export const RequestResetPasswordBadRequestApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    resetPasswordImpossible: {
      summary: 'Reset Password Impossible',
      value: {
        message: 'Reset Password Impossible!',
        code: ErrorCode.RESET_PASSWORD_IMPOSSIBLE,
      },
    },
  },
};

export const VerificationResetPasswordBadRequestApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    resetPasswordImpossible: {
      summary: 'Invalid Reset Code',
      value: {
        message: 'Invalid Reset Code!',
        code: ErrorCode.INVALID_RESET_CODE,
      },
    },
  },
};

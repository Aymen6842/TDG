import { GeneralErrorDto } from '../../common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from '../../common/exceptions/error-codes/error.code';

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

// bad request in account registration
export const InvalidDataOrUserAlreadyExistApiResponse = {
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

export const TeamAlreadyExistsOrInvalidDataBadRequestApiResponse = {
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
    teamAlreadyExists: {
      summary: 'This team already exists!',
      value: {
        message: 'This team already exists!',
        code: ErrorCode.TEAM_ALREADY_EXISTS,
      },
    },
  },
};

export const TeamNotFoundApiResponse = {
  status: 404,
  description: 'This team is not found!',
  type: GeneralErrorDto,
  examples: {
    teamNotFound: {
      summary: 'This team is not found!',
      value: {
        message: 'This team is not found!',
        code: ErrorCode.TEAM_NOT_FOUND,
      },
    },
  },
};

// bad request in account registration
export const ForbiddenApiResponse = {
  status: 403,
  description: 'Forbidden!',
  type: GeneralErrorDto,
  examples: {
    forbidden: {
      summary: 'Forbidden',
      value: {
        message: 'Forbidden!',
        code: ErrorCode.FORBIDDEN,
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

// the provided password is invalid or invalid data
export const RequestUpdatePasswordBadRequestApiResponse = {
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
    invalidPassword: {
      summary: 'Invalid Password',
      value: {
        message: 'Invalid Password!',
        code: ErrorCode.INVALID_PASSWORD,
      },
    },
    invalidPasswordUpdateExternalAccount: {
      summary:
        'Cannot update password for this account as it was registered via an external service',
      value: {
        message:
          'Cannot update password for this account as it was registered via an external service',
        code: ErrorCode.ACCOUNT_CREATED_VIA_ANOTHER_METHOD,
      },
    },
  },
};

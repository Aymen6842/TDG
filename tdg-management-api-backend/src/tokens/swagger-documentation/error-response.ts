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

// The provided data is invalid
export const RefreshTokenBadRequestApiResponse = {
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
    invalidJwtToken: {
      summary: 'Invalid Token',
      value: {
        message: 'Invalid Token!',
        code: ErrorCode.INVALID_JWT,
      },
    },
  },
};

// Unauthorized
export const UnauthorizedApiResponse = {
  status: 401,
  description: 'Unauthorized!',
  type: GeneralErrorDto,
  examples: {
    unthorized: {
      summary: 'Unauthorized!',
      value: {
        message: 'Unauthorized!',
        code: ErrorCode.UNAUTHORIZED,
      },
    },
  },
};

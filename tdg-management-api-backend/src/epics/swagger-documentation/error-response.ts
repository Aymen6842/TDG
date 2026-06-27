import { GeneralErrorDto } from 'src/common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

// Internal Server Error
export const InternalServerErrorApiResponse = {
  status: 500,
  description: 'Server Error!',
  type: GeneralErrorDto,
  examples: {
    serverError: {
      summary: 'Server Error!',
      value: {
        message: 'Server Error!',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      },
    },
  },
};

// Invalid Data Error
export const InvalidDataApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: { message: 'Invalid epic data', code: ErrorCode.INVALID_DATA },
    },
  },
};

// Forbidden Error
export const ForbiddenApiResponse = {
  status: 403,
  description: 'Forbidden!',
  type: GeneralErrorDto,
  examples: {
    forbidden: {
      summary: 'Forbidden',
      value: {
        message: 'You do not have permission',
        code: ErrorCode.FORBIDDEN,
      },
    },
  },
};

// Epic Not Found
export const EpicNotFoundApiResponse = {
  status: 404,
  description: 'Epic Not Found!',
  type: GeneralErrorDto,
  examples: {
    epicNotFound: {
      summary: 'Epic Not Found',
      value: { message: 'Epic not found', code: ErrorCode.EPIC_NOT_FOUND },
    },
  },
};

// Epic Already Exists
export const EpicAlreadyExistsApiResponse = {
  status: 409,
  description: 'Epic Already Exists!',
  type: GeneralErrorDto,
  examples: {
    epicAlreadyExists: {
      summary: 'Epic Already Exists',
      value: {
        message: 'Epic with this name already exists',
        code: ErrorCode.EPIC_ALREADY_EXISTS,
      },
    },
  },
};

// Epic Forbidden
export const EpicForbiddenApiResponse = {
  status: 403,
  description: 'Forbidden - No access to this epic',
  type: GeneralErrorDto,
  examples: {
    forbidden: {
      summary: 'Forbidden',
      value: {
        message: 'You do not have permission to access this epic',
        code: ErrorCode.FORBIDDEN,
      },
    },
  },
};

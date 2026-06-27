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

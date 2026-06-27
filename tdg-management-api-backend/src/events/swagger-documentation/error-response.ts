import { GeneralErrorDto } from 'src/common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

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

export const EventNotFoundApiResponse = {
  status: 404,
  description: 'The event with the provided id does not exist.',
  type: GeneralErrorDto,
  examples: {
    eventNotFound: {
      summary: 'Event Not Found',
      value: {
        message: 'The event with the provided id does not exist.',
        code: ErrorCode.EVENT_NOT_FOUND,
      },
    },
  },
};

export const EventAlreadyExistsApiResponse = {
  status: 400,
  description: 'The event with the provided id already exists.',
  type: GeneralErrorDto,
  examples: {
    eventAlreadyExists: {
      summary: 'Event Already Exists',
      value: {
        message: 'The event with the provided id already exists.',
        code: ErrorCode.EVENT_ALREADY_EXISTS,
      },
    },
  },
};

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

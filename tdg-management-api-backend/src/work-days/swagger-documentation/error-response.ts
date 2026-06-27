import { GeneralErrorDto } from '../../common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from '../../common/exceptions/error-codes/error.code';

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

export const SessionIsAlreadyOpenApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Work session is already open!',
      value: {
        message: 'Work session is already open!',
        code: ErrorCode.WORK_SESSION_ALREADY_OPEN,
      },
    },
  },
};

export const WorkDayNotFoundApiResponse = {
  status: 404,
  description: 'Work Day Not Found!',
  type: GeneralErrorDto,
  examples: {
    workDayNotFound: {
      summary: 'Work Day Not Found',
      value: {
        message: 'Work Day Not Found!',
        code: ErrorCode.WORK_DAY_NOT_FOUND,
      },
    },
  },
};

export const WorkSessionNotFoundApiResponse = {
  status: 404,
  description: 'Work Session Not Found!',
  type: GeneralErrorDto,
  examples: {
    workSessionNotFound: {
      summary: 'Work Session Not Found',
      value: {
        message: 'Work Session Not Found!',
        code: ErrorCode.WORK_SESSION_NOT_FOUND,
      },
    },
  },
};

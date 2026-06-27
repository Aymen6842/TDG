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

// Resource not found
export const ServerNotFoundApiResponse = {
  status: 404,
  description: 'Server Not Found!',
  type: GeneralErrorDto,
  examples: {
    serverNotFound: {
      summary: 'Server Not Found',
      value: {
        message: 'Server Not Found!',
        code: ErrorCode.SERVER_NOT_FOUND,
      },
    },
  },
};

// Resource already exists or invalid data
export const ServiceNotFoundApiResponse = {
  status: 404,
  description: 'Service Not Found!',
  type: GeneralErrorDto,
  examples: {
    serviceNotFound: {
      summary: 'Service Not Found',
      value: {
        message: 'Service Not Found!',
        code: ErrorCode.SERVICE_NOT_FOUND,
      },
    },
  },
};

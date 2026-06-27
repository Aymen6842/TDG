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

export const PersonalTaskNotFoundApiResponse = {
  status: 404,
  description: 'Personal Task Not Found!',
  type: GeneralErrorDto,
  examples: {
    personalTaskNotFound: {
      summary: 'Personal Task Not Found',
      value: {
        message: 'The requested personal task does not exist.',
        code: ErrorCode.PERSONAL_TASK_NOT_FOUND,
      },
    },
  },
};

export const PersonalTaskCommentNotFoundApiResponse = {
  status: 404,
  description: 'Personal Task Comment Not Found!',
  type: GeneralErrorDto,
  examples: {
    personalTaskCommentNotFound: {
      summary: 'Personal Task Comment Not Found',
      value: {
        message: 'The requested personal task comment does not exist.',
        code: ErrorCode.PERSONAL_TASK_COMMENT_NOT_FOUND,
      },
    },
  },
};

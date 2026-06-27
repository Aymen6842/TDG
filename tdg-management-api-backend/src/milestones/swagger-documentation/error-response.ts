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
      value: {
        message: 'Invalid milestone data',
        code: ErrorCode.INVALID_DATA,
      },
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

// Milestone Not Found
export const MilestoneNotFoundApiResponse = {
  status: 404,
  description: 'Milestone Not Found!',
  type: GeneralErrorDto,
  examples: {
    milestoneNotFound: {
      summary: 'Milestone Not Found',
      value: {
        message: 'Milestone not found',
        code: ErrorCode.MILESTONE_NOT_FOUND,
      },
    },
  },
};

// Milestone Already Exists
export const MilestoneAlreadyExistsApiResponse = {
  status: 409,
  description: 'Milestone Already Exists!',
  type: GeneralErrorDto,
  examples: {
    milestoneAlreadyExists: {
      summary: 'Milestone Already Exists',
      value: {
        message: 'Milestone with this name already exists',
        code: ErrorCode.MILESTONE_ALREADY_EXISTS,
      },
    },
  },
};

// Milestone Forbidden
export const MilestoneForbiddenApiResponse = {
  status: 403,
  description: 'Forbidden - No access to this milestone',
  type: GeneralErrorDto,
  examples: {
    forbidden: {
      summary: 'Forbidden',
      value: {
        message: 'You do not have permission to access this milestone',
        code: ErrorCode.FORBIDDEN,
      },
    },
  },
};

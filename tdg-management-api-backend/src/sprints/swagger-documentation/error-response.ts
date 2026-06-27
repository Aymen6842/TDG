import { GeneralErrorDto } from 'src/common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

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

export const InvalidDataApiResponse = {
  status: 400,
  description: 'Bad Request!',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid sprint data',
        code: ErrorCode.INVALID_DATA,
      },
    },
  },
};

export const ForbiddenApiResponse = {
  status: 403,
  description: 'Forbidden!',
  type: GeneralErrorDto,
  examples: {
    forbidden: {
      summary: 'Forbidden',
      value: {
        message: 'You do not have permission to perform this action',
        code: ErrorCode.FORBIDDEN,
      },
    },
  },
};

export const SprintNotFoundApiResponse = {
  status: 404,
  description: 'Sprint Not Found!',
  type: GeneralErrorDto,
  examples: {
    sprintNotFound: {
      summary: 'Sprint Not Found',
      value: {
        message: 'Sprint not found',
        code: ErrorCode.SPRINT_NOT_FOUND,
      },
    },
  },
};

export const SprintAlreadyExistsApiResponse = {
  status: 409,
  description: 'Sprint Already Exists!',
  type: GeneralErrorDto,
  examples: {
    sprintAlreadyExists: {
      summary: 'Sprint Already Exists',
      value: {
        message: 'Sprint with this name already exists',
        code: ErrorCode.SPRINT_ALREADY_EXISTS,
      },
    },
  },
};

export const SprintInvalidDateRangeApiResponse = {
  status: 400,
  description: 'Sprint Invalid Date Range!',
  type: GeneralErrorDto,
  examples: {
    sprintInvalidDateRange: {
      summary: 'Invalid Date Range',
      value: {
        message: 'End date must be after start date',
        code: ErrorCode.SPRINT_INVALID_DATE_RANGE,
      },
    },
  },
};

export const SprintAlreadyStartedApiResponse = {
  status: 409,
  description: 'Sprint Already Started!',
  type: GeneralErrorDto,
  examples: {
    sprintAlreadyStarted: {
      summary: 'Sprint Already Started',
      value: {
        message: 'Cannot update sprint that has already started',
        code: ErrorCode.SPRINT_ALREADY_STARTED,
      },
    },
  },
};

export const SprintAlreadyCompletedApiResponse = {
  status: 409,
  description: 'Sprint Already Completed!',
  type: GeneralErrorDto,
  examples: {
    sprintAlreadyCompleted: {
      summary: 'Sprint Already Completed',
      value: {
        message: 'Cannot update sprint that has already been completed',
        code: ErrorCode.SPRINT_ALREADY_COMPLETED,
      },
    },
  },
};

export const SprintHasActiveTasksApiResponse = {
  status: 409,
  description: 'Sprint Has Active Tasks!',
  type: GeneralErrorDto,
  examples: {
    sprintHasActiveTasks: {
      summary: 'Sprint Has Active Tasks',
      value: {
        message: 'Cannot delete sprint with tasks. Remove tasks first.',
        code: ErrorCode.SPRINT_HAS_ACTIVE_TASKS,
      },
    },
  },
};

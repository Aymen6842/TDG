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
      value: { message: 'Invalid task data', code: ErrorCode.INVALID_DATA },
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

// Task Not Found
export const TaskNotFoundApiResponse = {
  status: 404,
  description: 'Task Not Found!',
  type: GeneralErrorDto,
  examples: {
    taskNotFound: {
      summary: 'Task Not Found',
      value: { message: 'Task not found', code: ErrorCode.TASK_NOT_FOUND },
    },
  },
};

// Task Already Exists
export const TaskAlreadyExistsApiResponse = {
  status: 409,
  description: 'Task Already Exists!',
  type: GeneralErrorDto,
  examples: {
    taskAlreadyExists: {
      summary: 'Task Already Exists',
      value: {
        message: 'Task with this key already exists',
        code: ErrorCode.TASK_ALREADY_EXISTS,
      },
    },
  },
};

// Task Invalid Status Transition
export const TaskInvalidStatusTransitionApiResponse = {
  status: 400,
  description: 'Invalid Status Transition!',
  type: GeneralErrorDto,
  examples: {
    invalidTransition: {
      summary: 'Invalid Status Transition',
      value: {
        message: 'Cannot transition from DONE to BACKLOG',
        code: ErrorCode.TASK_INVALID_STATUS_TRANSITION,
      },
    },
  },
};

// Task Circular Dependency
export const TaskCircularDependencyApiResponse = {
  status: 400,
  description: 'Circular Dependency!',
  type: GeneralErrorDto,
  examples: {
    circularDependency: {
      summary: 'Circular Dependency',
      value: {
        message: 'Adding this dependency would create a circular reference',
        code: ErrorCode.TASK_CIRCULAR_DEPENDENCY,
      },
    },
  },
};

// Task Blocked
export const TaskBlockedApiResponse = {
  status: 400,
  description: 'Task Blocked!',
  type: GeneralErrorDto,
  examples: {
    taskBlocked: {
      summary: 'Task Blocked',
      value: {
        message: 'Task is blocked by another task',
        code: ErrorCode.TASK_BLOCKED,
      },
    },
  },
};

// Task Label Not Found
export const TaskLabelNotFoundApiResponse = {
  status: 404,
  description: 'Task Label Not Found!',
  type: GeneralErrorDto,
  examples: {
    taskLabelNotFound: {
      summary: 'Task Label Not Found',
      value: {
        message: 'Label not found',
        code: ErrorCode.TASK_LABEL_NOT_FOUND,
      },
    },
  },
};

// Task Label Already Exists
export const TaskLabelAlreadyExistsApiResponse = {
  status: 409,
  description: 'Task Label Already Exists!',
  type: GeneralErrorDto,
  examples: {
    taskLabelAlreadyExists: {
      summary: 'Task Label Already Exists',
      value: {
        message: 'Label with this name already exists in this project',
        code: ErrorCode.TASK_LABEL_ALREADY_EXISTS,
      },
    },
  },
};

// Task Label Already Assigned
export const TaskLabelAlreadyAssignedApiResponse = {
  status: 409,
  description: 'Label already assigned to this task!',
  type: GeneralErrorDto,
  examples: {
    taskLabelAlreadyAssigned: {
      summary: 'Label Already Assigned',
      value: {
        message: 'Label already assigned to this task',
        code: ErrorCode.TASK_LABEL_ALREADY_ASSIGNED,
      },
    },
  },
};

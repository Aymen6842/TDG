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
      value: { message: 'Invalid reminder data', code: ErrorCode.INVALID_DATA },
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

// Reminder Not Found
export const ReminderNotFoundApiResponse = {
  status: 404,
  description: 'Reminder Not Found!',
  type: GeneralErrorDto,
  examples: {
    reminderNotFound: {
      summary: 'Reminder Not Found',
      value: {
        message: 'Reminder not found',
        code: ErrorCode.REMINDER_NOT_FOUND,
      },
    },
  },
};

// Reminder Already Exists
export const ReminderAlreadyExistsApiResponse = {
  status: 409,
  description: 'Reminder Already Exists!',
  type: GeneralErrorDto,
  examples: {
    reminderAlreadyExists: {
      summary: 'Reminder Already Exists',
      value: {
        message: 'Reminder already exists',
        code: ErrorCode.REMINDER_ALREADY_EXISTS,
      },
    },
  },
};

// Reminder Forbidden
export const ReminderForbiddenApiResponse = {
  status: 403,
  description: 'Forbidden - No access to this reminder',
  type: GeneralErrorDto,
  examples: {
    forbidden: {
      summary: 'Forbidden',
      value: {
        message: 'You do not have permission to access this reminder',
        code: ErrorCode.FORBIDDEN,
      },
    },
  },
};

// Reminder Already Dismissed
export const ReminderAlreadyDismissedApiResponse = {
  status: 400,
  description: 'Reminder Already Dismissed!',
  type: GeneralErrorDto,
  examples: {
    reminderAlreadyDismissed: {
      summary: 'Reminder Already Dismissed',
      value: {
        message: 'Reminder is already dismissed',
        code: ErrorCode.REMINDER_ALREADY_DISMISSED,
      },
    },
  },
};

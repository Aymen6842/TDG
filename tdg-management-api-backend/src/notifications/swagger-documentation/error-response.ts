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

export const NotificationNotFoundApiResponse = {
  status: 404,
  description: 'This notification is not found!',
  type: GeneralErrorDto,
  examples: {
    userNotFound: {
      summary: 'This notification is not found!',
      value: {
        message: 'This notification is not found!',
        code: ErrorCode.NOTIFICATION_NOT_FOUND,
      },
    },
  },
};

export const NotificationTokenNotFoundApiResponse = {
  status: 404,
  description: 'This notificationToken is not found!',
  type: GeneralErrorDto,
  examples: {
    userNotFound: {
      summary: 'This notificationToken is not found!',
      value: {
        message: 'This notificationToken is not found!',
        code: ErrorCode.NOTIFICATION_TOKEN_NOT_FOUND,
      },
    },
  },
};

export const InvalidDataOrFcmSendErrorApiResponse = {
  status: 400,
  description: 'Firebase notification error',
  type: GeneralErrorDto,
  examples: {
    invalidData: {
      summary: 'Invalid Data',
      value: {
        message: 'Invalid Data!',
        code: ErrorCode.INVALID_DATA,
      },
    },
    fcmSendError: {
      summary: 'Firebase notification error',
      value: {
        message: 'Firebase notification error',
        code: ErrorCode.FCM_SEND_ERROR,
      },
    },
  },
};

import { GeneralErrorDto } from 'src/common/dto/swagger/errors/general-error.dto';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

// =============================
// Common Error Responses
// =============================

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
        message: 'Invalid project data',
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
        message: 'You do not have permission to perform this action',
        code: ErrorCode.FORBIDDEN,
      },
    },
  },
};

// =============================
// Project Specific Error Responses
// =============================

// Project Not Found
export const ProjectNotFoundApiResponse = {
  status: 404,
  description: 'Project Not Found!',
  type: GeneralErrorDto,
  examples: {
    projectNotFound: {
      summary: 'Project Not Found',
      value: {
        message: 'Project not found',
        code: ErrorCode.PROJECT_NOT_FOUND,
      },
    },
  },
};

// Project Already Exists
export const ProjectAlreadyExistsApiResponse = {
  status: 409,
  description: 'Project Already Exists!',
  type: GeneralErrorDto,
  examples: {
    projectAlreadyExists: {
      summary: 'Project Already Exists',
      value: {
        message: 'Project with this name already exists',
        code: ErrorCode.PROJECT_ALREADY_EXISTS,
      },
    },
  },
};

// Project Member Not Found
export const ProjectMemberNotFoundApiResponse = {
  status: 404,
  description: 'Project Member Not Found!',
  type: GeneralErrorDto,
  examples: {
    projectMemberNotFound: {
      summary: 'Project Member Not Found',
      value: {
        message: 'Project member not found',
        code: ErrorCode.PROJECT_MEMBER_NOT_FOUND,
      },
    },
  },
};

// Project Member Already Exists
export const ProjectMemberAlreadyExistsApiResponse = {
  status: 409,
  description: 'Project Member Already Exists!',
  type: GeneralErrorDto,
  examples: {
    projectMemberAlreadyExists: {
      summary: 'Project Member Already Exists',
      value: {
        message: 'User is already a member of this project',
        code: ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS,
      },
    },
  },
};

// Project Already Has Manager
export const ProjectAlreadyHasManagerApiResponse = {
  status: 400,
  description: 'Project Already Has Manager!',
  type: GeneralErrorDto,
  examples: {
    projectAlreadyHasManager: {
      summary: 'Project Already Has Manager',
      value: {
        message: 'Only one project manager is allowed per project',
        code: ErrorCode.PROJECT_ALREADY_HAS_MANAGER,
      },
    },
  },
};

// Project Cannot Change Business Unit
export const ProjectCannotChangeBusinessUnitApiResponse = {
  status: 400,
  description: 'Cannot Change Business Unit!',
  type: GeneralErrorDto,
  examples: {
    projectCannotChangeBusinessUnit: {
      summary: 'Cannot Change Business Unit',
      value: {
        message: 'Business unit cannot be changed after creation',
        code: ErrorCode.PROJECT_CANNOT_CHANGE_BUSINESS_UNIT,
      },
    },
  },
};

// Project Forbidden
export const ProjectForbiddenApiResponse = {
  status: 403,
  description: 'Project Forbidden!',
  type: GeneralErrorDto,
  examples: {
    projectForbidden: {
      summary: 'Project Forbidden',
      value: {
        message:
          'You do not have permission to perform this action on this project',
        code: ErrorCode.PROJECT_FORBIDDEN,
      },
    },
  },
};

// Invalid Project Data
export const ProjectInvalidDataApiResponse = {
  status: 400,
  description: 'Invalid Project Data!',
  type: GeneralErrorDto,
  examples: {
    invalidProjectData: {
      summary: 'Invalid Project Data',
      value: {
        message: 'Invalid project data',
        code: ErrorCode.INVALID_DATA,
      },
    },
  },
};

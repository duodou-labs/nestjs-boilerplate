import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';
import { ICustomError } from '../interfaces/custom-error.interface';

type Func = (args: any) => ICustomError;
type ErrorValue = ICustomError | Func;

export const ERROR: Record<ErrorCode, ErrorValue> = {
  [ErrorCode.API_PERMISSION_MISSED]: (apiName: string) => ({
    message: `Your API "${apiName}" is missing permission configuration, please going to file entity.constant.ts and set up permission for it`,
    description: `Your API "${apiName}" is missing permission configuration, please going to file entity.constant.ts and set up permission for it`,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    serverErrorCode: ErrorCode.API_PERMISSION_MISSED,
  }),
  [ErrorCode.FORBIDDEN_RESOURCE]: {
    message: "You don't have permission to access this resource.",
    description:
      "You don't have permission to access this resource, please contact administrator to address your issue",
    statusCode: HttpStatus.FORBIDDEN,
    serverErrorCode: ErrorCode.FORBIDDEN_RESOURCE,
  },
  [ErrorCode.ACCOUNT_EXISTED]: {
    message: 'Your email address has already existed',
    description: 'Your email address has already existed',
    statusCode: HttpStatus.CONFLICT,
    serverErrorCode: ErrorCode.ACCOUNT_EXISTED,
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    message: 'Your email or password is incorrect',
    description: 'Your email or password is incorrect',
    statusCode: HttpStatus.UNAUTHORIZED,
    serverErrorCode: ErrorCode.INVALID_CREDENTIALS,
  },
  [ErrorCode.TOKEN_EXPIRES]: {
    message: 'Your token is expired',
    description: 'Your token is expired',
    statusCode: HttpStatus.NOT_FOUND,
    serverErrorCode: ErrorCode.TOKEN_EXPIRES,
  },
  [ErrorCode.TOO_MANY_REQUESTS]: {
    message: 'Too many requests, try again later',
    description: 'Too many requests, try again later',
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    serverErrorCode: ErrorCode.TOO_MANY_REQUESTS,
  },
  // ROLE ERROR
  [ErrorCode.ROLE_EXISTED]: {
    message: 'Role has already existed',
    description: 'Role has already existed',
    statusCode: HttpStatus.CONFLICT,
    serverErrorCode: ErrorCode.ROLE_EXISTED,
  },
  // SCOPE ERROR
  [ErrorCode.SCOPE_EXISTED]: {
    message: 'Scope has already existed',
    description: 'Scope has already existed',
    statusCode: HttpStatus.CONFLICT,
    serverErrorCode: ErrorCode.SCOPE_EXISTED,
  },
  // USER ERROR
  [ErrorCode.USER_NOT_FOUND]: {
    message: 'User does not exist',
    description: 'User does not exist',
    statusCode: HttpStatus.NOT_FOUND,
    serverErrorCode: ErrorCode.USER_NOT_FOUND,
  },
  [ErrorCode.STARTUP_USER_REQUIRED]: {
    message: 'Missing config startup user',
    description: 'Missing config startup user. Please update config and restart server again!',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    serverErrorCode: ErrorCode.STARTUP_USER_REQUIRED,
  },
};

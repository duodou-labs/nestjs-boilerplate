import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';

export interface ICustomError {
  message: string;
  description: string;
  statusCode: HttpStatus;
  serverErrorCode: ErrorCode;
}

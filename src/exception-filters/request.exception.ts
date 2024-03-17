/* eslint-disable @typescript-eslint/no-unused-vars */
import { STATUS_CODES } from 'http';

import { ERROR } from '@common/constants/errors.constant';
import { ErrorCode } from '@common/enums/error-code.enum';
import { GeneralLogger } from '@logger/general.logger';
import { ArgumentsHost, BadRequestException, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ValidationError } from 'class-validator';
import { isArray, isEmpty, snakeCase } from 'lodash';

const standardizeStatusCode = (exception: any): [HttpStatus, HttpStatus, ErrorCode, string] => {
  let ex = exception;

  if (Array.isArray(exception) && exception.length) {
    ex = exception[0];
  }

  const errorRes = ex.getResponse() as any;
  const { response, ...restOfException } = errorRes;

  const statusCode = response?.statusCode || restOfException?.statusCode;
  const { code, serverErrorCode } = restOfException;
  const appCode = response?.serverErrorCode || serverErrorCode;
  const description = response?.description || restOfException?.description;

  return [statusCode, code, appCode, description];
};

@Catch(HttpException)
export class RequestExceptionFilter implements GqlExceptionFilter {
  private readonly _generalLogger = new GeneralLogger('RequestException');

  constructor(public reflector: Reflector) {}

  async catch(exception: any, host: ArgumentsHost) {
    // const gqlHost = GqlArgumentsHost.create(host);
    const res = exception.getResponse();

    if (typeof res === 'string' && res.includes('ThrottlerException')) {
      const errorMsg = ERROR[ErrorCode.TOO_MANY_REQUESTS];
      this._generalLogger.error(JSON.stringify(errorMsg));
      throw new BadRequestException(errorMsg);
    }

    const { response: _, ...r } = res;

    const errorCode = standardizeStatusCode(exception);
    let statusCode = errorCode[0];

    if (isArray(r.message) && r.message[0] instanceof ValidationError) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;

      const validationErrors = <ValidationError[]>r.message;

      this._validationFilter(validationErrors);
    }

    r.statusCode = statusCode;
    r.error = STATUS_CODES[statusCode];

    Object.assign(r, { appErrorCode: errorCode[2], description: errorCode[3] });

    this._generalLogger.error(JSON.stringify(r));

    switch (host.getType() as string) {
      case 'http':
        const response = host.switchToHttp().getResponse();
        response.status(exception.getStatus()).send(r);
        break;
      case 'graphql':
        return new HttpException(r, statusCode);
    }
  }

  private _validationFilter(validationErrors: ValidationError[]) {
    for (const validationError of validationErrors) {
      for (const [constraintKey, constraint] of Object.entries(validationError.constraints)) {
        if (!constraint) {
          // convert error message to error.fields.{key} syntax for i18n translation
          validationError.constraints[constraintKey] = 'error.fields.' + snakeCase(constraintKey);
        }
      }

      if (!isEmpty(validationError.children)) {
        this._validationFilter(validationError.children);
      }
    }
  }
}

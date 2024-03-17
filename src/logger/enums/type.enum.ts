import { registerEnumType } from '@nestjs/graphql';

export enum LogType {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
  VERBOSE = 'VERBOSE',
}

registerEnumType(LogType, { name: 'LogType' });

import { GeneralLogger } from '@logger/general.logger';
import { Injectable } from '@nestjs/common';
import { QueryRunner, Logger as TypeOrmLogger } from 'typeorm';

@Injectable()
export class DatabaseLogger implements TypeOrmLogger {
  private _generalLogger = new GeneralLogger('Database');

  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }

    const params = parameters ? ` -- Parameters: ${this.stringifyParameters(parameters)}` : '';
    const msg = `${query}${params}`;
    this._generalLogger.log(msg);
  }

  logQueryError(error: string, query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }

    const params = parameters ? ` -- Parameters: ${this.stringifyParameters(parameters)}` : '';
    const msg = `${query}${params} -- ${error}`;
    this._generalLogger.error(msg);
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }

    const params = parameters ? ` -- Parameters: ${this.stringifyParameters(parameters)}` : '';
    const msg = `Time: ${time}${params} -- ${query}`;
    this._generalLogger.warn(msg);
  }

  logMigration(message: string) {
    this._generalLogger.log(message);
  }

  logSchemaBuild(message: string) {
    this._generalLogger.log(message);
  }

  log(level: 'log' | 'info' | 'warn', message: string, queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    if (level === 'log') {
      return this._generalLogger.log(message);
    }
    if (level === 'info') {
      return this._generalLogger.log(message);
    }
    if (level === 'warn') {
      return this._generalLogger.warn(message);
    }
  }

  private stringifyParameters(parameters?: unknown[]) {
    try {
      return JSON.stringify(parameters);
    } catch {
      return '';
    }
  }
}

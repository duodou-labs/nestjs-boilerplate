import { Injectable, LoggerService } from '@nestjs/common';
import 'winston-daily-rotate-file';

import { DateFormat } from '@common/enums/date-format.enum';
import { formatDate } from '@common/utils/format-date.util';
import configuration from '@config/environment.config';
import * as PrettyError from 'pretty-error';
import * as winston from 'winston';

const config = configuration();

@Injectable()
export class GeneralLogger implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly prettyError = new PrettyError();

  constructor(private context: string) {
    const { config } = winston;
    const customLevel = {
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
        lightGrey: 7,
        logTime: 8,
        context: 9,
      },
      colors: {
        error: 'bold red',
        warn: 'bold yellow',
        info: 'bold cyan',
        http: 'bold green',
        verbose: 'bold green',
        debug: 'bold gray',
        silly: 'bold pink',
        lightGrey: 'gray',
        logTime: 'yellow',
        context: 'bold green',
      },
    };

    config.addColors(customLevel.colors);
    this.logger = (winston as any).createLogger({
      levels: customLevel.levels,
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '5m',
          maxFiles: '14d',
        }),
      ],
    });
    this.prettyError.skipNodeFiles();
    this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
  }

  get Logger(): winston.Logger {
    return this.logger; // idk why i have this in my code !
  }

  log(message: string): void {
    const currentDate = new Date();
    this.logger.info(message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formattedLog('info', message);
  }

  error(message: string, trace?: any): void {
    const currentDate = new Date();
    // i think the trace should be JSON Stringified
    this.logger.error(`${message} -> (${trace || 'trace not provided !'})`, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formattedLog('error', message, trace);
  }

  warn(message: string): void {
    const currentDate = new Date();
    this.logger.warn(message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formattedLog('warn', message);
  }

  success(message: string): void {
    const currentDate = new Date();
    this.logger.info(message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
    });
    this.formattedLog('success', message);
  }

  overrideOptions(options: winston.LoggerOptions) {
    this.logger.configure(options);
  }

  private formattedLog(level: string, message: string, error?): void {
    let result = '';
    const { colorize } = winston.format;
    const color = colorize();
    const currentDate = new Date();
    const time = formatDate(currentDate, DateFormat.FULL_DATE_TIME);

    const formatMessage = (level: string) => {
      return `[${color.colorize(level, level.toUpperCase())}] ${color.colorize('logTime', time)} [${color.colorize(
        'context',
        this.context,
      )}] ${message}`;
    };

    switch (level) {
      case 'info':
        result = formatMessage(level);
        break;
      case 'error':
        result = formatMessage(level);
        if (error && config.nodeEnv === 'development') this.prettyError.render(error, true);
        break;
      case 'warn':
        result = formatMessage(level);
        break;
      default:
        break;
    }
    console.log(result);
  }
}

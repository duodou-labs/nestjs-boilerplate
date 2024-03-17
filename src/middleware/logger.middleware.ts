import { GeneralLogger } from '@logger/general.logger';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private _generalLogger = new GeneralLogger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const { ip, method, originalUrl } = req;
      const { statusCode, statusMessage } = res;
      const userAgent = req.get('User-Agent');

      if (originalUrl.startsWith('/graphql')) {
        return;
      }

      const message = `${ip} - ${method} ${originalUrl} ${statusCode} ${statusMessage} - ${userAgent}`;

      if (statusCode >= 500) {
        return this._generalLogger.error(message);
      }

      if (statusCode >= 400) {
        return this._generalLogger.warn(message);
      }

      return this._generalLogger.log(message);
    });

    next();
  }
}

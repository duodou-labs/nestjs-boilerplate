import { GraphQLRequestContext } from '@apollo/server';
import type { WithRequired } from '@apollo/utils.withrequired';
import { GeneralLogger } from '@logger/general.logger';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GraphQLLogger {
  private _generalLogger = new GeneralLogger('GraphQL');

  async requestDidStart() {
    return {
      logger: this._generalLogger,
      async parsingDidStart(requestContext: WithRequired<GraphQLRequestContext<any>, 'source' | 'queryHash'>) {
        const { request, contextValue } = requestContext;
        const { operationName, variables, query, http } = request;

        if (operationName === 'IntrospectionQuery') return;

        const { headers } = http;
        const userAgent = headers.get('User-Agent');
        const { ip, method, originalUrl } = contextValue.req;

        const message = `${ip} - ${method} ${originalUrl} ${operationName} ${JSON.stringify(
          query,
        )} - Variables: ${JSON.stringify(variables)} - ${userAgent}`;

        this.logger.log(message);
      },
      async didEncounterErrors(requestContext) {
        const { operationName, errors, contextValue, request } = requestContext;
        const { ip, method, originalUrl } = contextValue.req;
        const { http } = request;
        const { headers } = http;
        const userAgent = headers.get('User-Agent');
        const { message } = errors[0];

        const error = `${ip} - ${method} ${originalUrl} ${operationName} Error: ${message} - ${userAgent}`;

        this.logger.error(error);
      },
    };
  }
}

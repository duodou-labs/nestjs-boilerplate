import { NestDataLoader } from '@common/interfaces/dataloader.interface';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  Type,
  createParamDecorator,
} from '@nestjs/common';
import { APP_INTERCEPTOR, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

const NEST_LOADER_CONTEXT_KEY: string = 'NEST_LOADER_CONTEXT_KEY';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}
  /**
   * @inheritdoc
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();
    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = {
        contextId: ContextIdFactory.create(),
        getLoader: (type: string): Promise<NestDataLoader<any, any>> => {
          if (ctx[type] === undefined) {
            try {
              ctx[type] = (async () => {
                const { contextId } = ctx[NEST_LOADER_CONTEXT_KEY];
                return (
                  await this.moduleRef.resolve<NestDataLoader<any, any>>(type, contextId, {
                    strict: false,
                  })
                ).generateDataLoader();
              })();
            } catch (e) {
              throw new InternalServerErrorException(`The loader ${type} is not provided` + e);
            }
          }
          return ctx[type];
        },
      };
    }
    return next.handle();
  }
}

/**
 * The decorator to be used within your graphql method.
 */
export const Loader = createParamDecorator(
  async (data: Type<NestDataLoader<any, any>>, context: ExecutionContext & { [key: string]: any }) => {
    const ctx: any = GqlExecutionContext.create(context).getContext();
    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
      `);
    }

    return await ctx[NEST_LOADER_CONTEXT_KEY].getLoader(data);
  },
);

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { DatabaseLogger } from '@logger/database.logger';
import { GraphQLLogger } from '@logger/graphql.logger';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { HttpStatus, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from '@strategies/snake-naming.strategy';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

import configuration from './environment.config';
import { IConfig } from './interfaces/config.interface';
import { IJwt } from './interfaces/jwt.interface';
import { ILog } from './interfaces/log.interface';
import { IStartupUser } from './interfaces/startup-user.interface';

@Injectable()
export class ConfigService {
  privateConfig: IConfig = configuration();

  get config(): IConfig {
    return this.privateConfig;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isStaging(): boolean {
    return this.nodeEnv === 'staging';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get nodeEnv(): string {
    return this.config.nodeEnv;
  }

  get logConfig(): ILog {
    return this.config.log;
  }

  get jwtConfig(): IJwt {
    return this.config.jwtConfig;
  }

  get startupUser(): IStartupUser {
    return this.config.user;
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    let entities = [__dirname + '/../modules/**/*.entity{.ts,.js}'];
    let migrations = [__dirname + '/../migrations/*{.ts,.js}'];

    if ((<any>module).hot) {
      const entityContext = (<any>require).context('./../modules', true, /\.entity\.ts$/);

      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext(id);
        const [entity] = Object.values(entityModule);

        return entity;
      });

      const migrationContext = (<any>require).context('./../migrations', false, /\.ts$/);

      migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext(id);
        const [migration] = Object.values(migrationModule);

        return migration;
      });
    }

    const options: TypeOrmModuleOptions = {
      entities,
      migrations,
      keepConnectionAlive: true,
      type: 'postgres',
      host: this.config.db.host,
      port: this.config.db.port,
      username: this.config.db.username,
      password: this.config.db.password,
      database: this.config.db.database,
      synchronize: false,
      migrationsRun: true,
      namingStrategy: new SnakeNamingStrategy(),
      logging: false,
      logger: new DatabaseLogger(),
    };

    return options;
  }

  get graphQLConfig(): ApolloDriverConfig {
    const resolvers = {};

    const formatExceptionMsg = (msg: string) => {
      const regex = new RegExp(/Variable .* got invalid value/gm);

      if (regex.test(msg)) {
        const [_, newMessage] = msg.split('; ');

        return newMessage || msg;
      }

      return msg;
    };

    return {
      resolvers,
      playground: false,
      path: '/api/graphql',
      introspection: this.isDevelopment,
      plugins: [ApolloServerPluginLandingPageLocalDefault(), new GraphQLLogger()],
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      formatError: (error: GraphQLError) => {
        const { extensions, message } = error;
        const { code, status, originalError } = extensions;
        const msg = (originalError as any)?.message || message;
        const appErrorCode = (originalError as any)?.appErrorCode || code;
        const statusCode = (originalError as any)?.statusCode || status;

        const graphQLFormattedError: GraphQLFormattedError = {
          message: formatExceptionMsg(msg),
          extensions: {
            appErrorCode,
            status: statusCode || HttpStatus.BAD_REQUEST,
          },
        };

        return graphQLFormattedError;
      },
    };
  }
}

import * as dotenv from 'dotenv';
import { IConfig } from './interfaces/config.interface';

const environments = ['development', 'test', 'staging', 'production'];

if (environments.includes(process.env.NODE_ENV)) {
  dotenv.config({
    path: `.${process.env.NODE_ENV}.env`,
  });
}

export default function configuration(): IConfig {
  const configs = {
    nodeEnv: process.env.NODE_ENV,
    port: Number.parseInt(process.env.PORT, 10),
    jwtConfig: {
      secretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
      secretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
      expirationAccessToken: process.env.JWT_EXPIRATION_ACCESS_TOKEN,
      expirationRefreshToken: process.env.JWT_EXPIRATION_REFRESH_TOKEN,
    },
    db: {
      host: process.env.RDS_HOSTNAME,
      port: Number.parseInt(process.env.RDS_PORT, 10),
      username: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DB_NAME,
    },
    log: {
      dailyRotateFileName: process.env.LOG_DAILY_ROTATE_FILENAME,
      dailyRotateMaxSize: process.env.LOG_DAILY_ROTATE_MAX_SIZE,
      dailyRotateMaxFiles: process.env.LOG_DAILY_ROTATE_MAX_FILES,
    },
    user: {
      firstName: process.env.ROOT_FIRST_NAME,
      lastName: process.env.ROOT_LAST_NAME,
      email: process.env.ROOT_EMAIL,
      password: process.env.ROOT_PASSWORD,
    },
  };

  return configs;
}

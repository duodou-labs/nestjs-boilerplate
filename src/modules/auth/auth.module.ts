import { ConfigService } from '@config/config.service';
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { SharedModule } from '@shared/shared.module';

import { UsersModule } from '@users/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [SharedModule],
      useFactory: (configService: ConfigService): Promise<JwtModuleOptions> | JwtModuleOptions => {
        const { secretAccessToken, expirationAccessToken } = configService.jwtConfig;

        return {
          secret: secretAccessToken,
          signOptions: {
            expiresIn: expirationAccessToken,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Public } from '@decorators/public.decorator';
import { HttpStatus } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Resolver()
export class AuthResolver {
  constructor(private _authService: AuthService) {}

  @Public()
  @Mutation(() => Int)
  register(@Args('payload') payload: RegisterDto): Promise<HttpStatus> {
    return this._authService.register(payload);
  }

  @Public()
  @Mutation(() => LoginResponseDto)
  login(@Args('payload') payload: LoginDto): Promise<LoginResponseDto> {
    return this._authService.login(payload);
  }

  @Public()
  @Mutation(() => LoginResponseDto)
  refreshToken(@Args('accessToken', { type: () => String }) accessToken: string): Promise<TokenDto> {
    return this._authService.refreshToken(accessToken);
  }
}

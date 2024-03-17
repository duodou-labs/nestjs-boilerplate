import { ERROR } from '@common/constants/errors.constant';
import { ErrorCode } from '@common/enums/error-code.enum';
import { ConfigService } from '@config/config.service';
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilsService } from '@providers/utils.service';

import { GeneralLogger } from '@logger/general.logger';
import { UserRepository } from '@users/user.repository';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger: GeneralLogger = new GeneralLogger(AuthService.name);

  constructor(
    private _jwtService: JwtService,
    private _config: ConfigService,
    private _userRepo: UserRepository,
  ) {}

  /**
   * Register a new user, and add user's role
   * @param payload an object instance of {@link RegisterDto}
   * @returns HttpStatus: 200 - register success, 409 if email address has existed
   */
  async register(payload: RegisterDto): Promise<HttpStatus> {
    const { email, password } = payload;

    const userExisted = await this._userRepo.findOne({
      where: { email },
    });

    if (userExisted) {
      throw new ConflictException(ERROR[ErrorCode.ACCOUNT_EXISTED]);
    }

    try {
      const { salt, hash: passwordHash } = await UtilsService.hashPassword(password);
      await this._userRepo.save({
        ...payload,
        passwordHash,
        salt,
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /**
   * Login
   * @param payload an object instance of {@link LoginDto}
   * @returns
   * - an object instance of {@link LoginResponseDto}
   * - 404 - User does not exist
   * - 401 - Invalid credentials
   */
  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = payload;
    const { expirationRefreshToken, secretRefreshToken } = this._config.jwtConfig;

    const user = await this._userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(ERROR[ErrorCode.USER_NOT_FOUND]);
    }

    try {
      const match = await UtilsService.comparePassword(password, user.salt, user.passwordHash);

      if (!match) {
        throw new UnauthorizedException(ERROR[ErrorCode.INVALID_CREDENTIALS]);
      }

      const accessToken = await this._jwtService.signAsync({ id: user.id });
      const refreshToken = await this._jwtService.signAsync(
        { id: user.id },
        { secret: secretRefreshToken, expiresIn: expirationRefreshToken },
      );

      return {
        ...user,
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async refreshToken(accessToken: string): Promise<TokenDto> {
    let decodedPayload;
    const { jwtConfig } = this._config;
    const { secretAccessToken, secretRefreshToken, expirationRefreshToken } = jwtConfig;

    try {
      decodedPayload = await this._jwtService.decode(accessToken);
      await this._jwtService.verifyAsync(accessToken, { secret: secretAccessToken });
    } catch (e) {
      this.logger.error(e);
    } finally {
      const newAccessToken = await this._jwtService.signAsync({ id: decodedPayload.id });
      const newRefreshToken = await this._jwtService.signAsync(
        { id: decodedPayload.id },
        { secret: secretRefreshToken, expiresIn: expirationRefreshToken },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    }
  }
}

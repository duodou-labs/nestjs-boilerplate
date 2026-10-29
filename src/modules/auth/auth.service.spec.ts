import { ERROR } from '@common/constants/errors.constant';
import { ErrorCode } from '@common/enums/error-code.enum';
import { ConfigService } from '@config/config.service';
import {
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from '@providers/utils.service';
import { UserRepository } from '@users/user.repository';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: jest.Mocked<Pick<UserRepository, 'findOne' | 'save'>>;
  let jwtService: { signAsync: jest.Mock };
  let configService: { jwtConfig: Record<string, string> };

  const registerPayload: RegisterDto = {
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'secret-password',
  };

  const loginPayload: LoginDto = {
    email: 'user@example.com',
    password: 'secret-password',
  };

  const storedUser = {
    id: 'user-id-1',
    email: loginPayload.email,
    firstName: 'Jane',
    lastName: 'Doe',
    salt: 'user-salt',
    passwordHash: 'user-hash',
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    configService = {
      jwtConfig: {
        secretRefreshToken: 'refresh-secret',
        expirationRefreshToken: '7d',
        secretAccessToken: 'access-secret',
        expirationAccessToken: '3600',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: UserRepository, useValue: userRepo },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('returns HttpStatus.OK when the email is new and save succeeds', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(undefined as never);

      const hashSpy = jest.spyOn(UtilsService, 'hashPassword').mockResolvedValue({
        salt: 'mock-salt',
        hash: 'mock-hash',
      });

      await expect(authService.register(registerPayload)).resolves.toBe(HttpStatus.OK);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: registerPayload.email } });
      expect(hashSpy).toHaveBeenCalledWith(registerPayload.password);
      expect(userRepo.save).toHaveBeenCalledWith({
        ...registerPayload,
        passwordHash: 'mock-hash',
        salt: 'mock-salt',
      });

      hashSpy.mockRestore();
    });

    it('throws ConflictException when a user with the same email already exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'existing-id', email: registerPayload.email } as never);

      await expect(authService.register(registerPayload)).rejects.toThrow(ConflictException);
      await expect(authService.register(registerPayload)).rejects.toMatchObject({
        response: ERROR[ErrorCode.ACCOUNT_EXISTED],
      });

      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when save fails', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.save.mockRejectedValue(new Error('database error'));

      const hashSpy = jest.spyOn(UtilsService, 'hashPassword').mockResolvedValue({
        salt: 'mock-salt',
        hash: 'mock-hash',
      });

      await expect(authService.register(registerPayload)).rejects.toThrow(InternalServerErrorException);

      hashSpy.mockRestore();
    });

    it('throws InternalServerErrorException when password hashing fails', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const hashSpy = jest.spyOn(UtilsService, 'hashPassword').mockRejectedValue(new Error('hash failed'));

      await expect(authService.register(registerPayload)).rejects.toThrow(InternalServerErrorException);

      expect(userRepo.save).not.toHaveBeenCalled();
      hashSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('returns user fields with access and refresh tokens when credentials are valid', async () => {
      userRepo.findOne.mockResolvedValue(storedUser as never);
      jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      const compareSpy = jest.spyOn(UtilsService, 'comparePassword').mockResolvedValue(true);

      await expect(authService.login(loginPayload)).resolves.toEqual({
        ...storedUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: loginPayload.email } });
      expect(compareSpy).toHaveBeenCalledWith(loginPayload.password, storedUser.salt, storedUser.passwordHash);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, { id: storedUser.id });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { id: storedUser.id },
        {
          secret: configService.jwtConfig.secretRefreshToken,
          expiresIn: configService.jwtConfig.expirationRefreshToken,
        },
      );

      compareSpy.mockRestore();
    });

    it('throws NotFoundException when no user exists for the email', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(authService.login(loginPayload)).rejects.toThrow(NotFoundException);
      await expect(authService.login(loginPayload)).rejects.toMatchObject({
        response: ERROR[ErrorCode.USER_NOT_FOUND],
      });

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      userRepo.findOne.mockResolvedValue(storedUser as never);

      const compareSpy = jest.spyOn(UtilsService, 'comparePassword').mockResolvedValue(false);

      await expect(authService.login(loginPayload)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginPayload)).rejects.toMatchObject({
        response: ERROR[ErrorCode.INVALID_CREDENTIALS],
      });

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      compareSpy.mockRestore();
    });

    it('throws InternalServerErrorException when password comparison fails', async () => {
      userRepo.findOne.mockResolvedValue(storedUser as never);

      const compareSpy = jest.spyOn(UtilsService, 'comparePassword').mockRejectedValue(new Error('compare failed'));

      await expect(authService.login(loginPayload)).rejects.toThrow(InternalServerErrorException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      compareSpy.mockRestore();
    });

    it('throws InternalServerErrorException when signing tokens fails', async () => {
      userRepo.findOne.mockResolvedValue(storedUser as never);
      jwtService.signAsync.mockRejectedValue(new Error('jwt sign failed'));

      const compareSpy = jest.spyOn(UtilsService, 'comparePassword').mockResolvedValue(true);

      await expect(authService.login(loginPayload)).rejects.toThrow(InternalServerErrorException);

      compareSpy.mockRestore();
    });
  });
});

import { ERROR } from '@common/constants/errors.constant';
import { ErrorCode } from '@common/enums/error-code.enum';
import { ConfigService } from '@config/config.service';
import { ConflictException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from '@providers/utils.service';
import { UserRepository } from '@users/user.repository';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: jest.Mocked<Pick<UserRepository, 'findOne' | 'save'>>;

  const registerPayload: RegisterDto = {
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'secret-password',
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
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
});

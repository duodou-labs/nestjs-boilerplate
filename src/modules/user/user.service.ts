import { ERROR } from '@common/constants/errors.constant';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PagingResponseDto } from '@common/dto/paging-response.dto';
import { ErrorCode } from '@common/enums/error-code.enum';
import { ConfigService } from '@config/config.service';
import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { UtilsService } from './../../providers/utils.service';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService extends BaseService<UserDto> implements OnModuleInit {
  constructor(
    private readonly _repo: UserRepository,
    private readonly _config: ConfigService,
  ) {
    super(_repo);
  }

  async onModuleInit() {
    await this.createSuperAdmin();
  }

  async createSuperAdmin(): Promise<void> {
    const { startupUser } = this._config;

    if (!startupUser.email) {
      throw new InternalServerErrorException(ERROR[ErrorCode.STARTUP_USER_REQUIRED]);
    }

    const { email, password, firstName, lastName } = startupUser;

    this.logger.log(`Checking startup user ${email}`);
    const userExisted = await this._repo.findOne({
      where: { email },
    });

    if (userExisted) {
      this.logger.success(`Startup user ${email} has already existed`);
      return;
    }

    try {
      this.logger.log(`Creating startup user ${email}`);
      const { salt, hash: passwordHash } = await UtilsService.hashPassword(password);

      await this._repo.save(
        this._repo.create({
          email,
          firstName,
          lastName,
          passwordHash,
          salt,
        }),
      );

      this.logger.success(`Create startup user ${email} success`);
    } catch (e) {
      this.throwInternalServerError(e);
    }
  }

  /**
   * Get all of the users
   * @returns a list of users
   */
  async getUsers(options: PageOptionsDto): Promise<PagingResponseDto<UserDto>> {
    try {
      const { q } = options;
      const { entityName } = this;
      const qb = this.createBaseQueryBuilder(options);

      if (q) {
        qb.andWhere(`to_tsquery(CONCAT("${entityName}".first_name, ' | ', "${entityName}".last_name)) @@ :q`, {
          q,
        });
      }

      const { data, ...meta } = await qb.paginate(options);

      return data.toPageDto(meta, options);
    } catch (e) {
      this.throwInternalServerError(e);
    }
  }

  /**
   * Get an user by ID
   * @param id User's ID
   * @returns an object instance of {@link UserDto}
   */
  async getUserById(id: string): Promise<UserDto> {
    try {
      const user = await this._repo.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(ERROR[ErrorCode.USER_NOT_FOUND]);
      }

      return user.toDto();
    } catch (e) {
      this.throwInternalServerError(e);
    }
  }
}

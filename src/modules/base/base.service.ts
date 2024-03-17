import { PageOptionsDto } from '@common/dto/page-options.dto';
import { GeneralLogger } from '@logger/general.logger';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from './base.repository';

@Injectable()
export abstract class BaseService<E> {
  public readonly entityName: string;
  public readonly logger: GeneralLogger;

  constructor(private _repository: BaseRepository<E>) {
    this.entityName = this._repository.metadata.name;
    this.logger = new GeneralLogger(this.entityName);
  }

  createBaseQueryBuilder(payload: PageOptionsDto): SelectQueryBuilder<E> {
    const { isDeleted, ids } = payload;

    const queryBuilder = this._repository.createQueryBuilder(this.entityName);

    if (ids?.length) {
      queryBuilder.whereInIds(ids);
    }

    if (isDeleted) queryBuilder.andWhere(`${this.entityName}.deleted_at IS NOT NULL`).withDeleted();

    return queryBuilder;
  }

  throwInternalServerError(e): HttpException {
    this.logger.error(e);

    if (e instanceof HttpException) throw e;

    throw new InternalServerErrorException(e);
  }

  throwBadRequestError(e): HttpException {
    this.logger.error(e);

    if (e instanceof HttpException) throw e;

    throw new InternalServerErrorException(e);
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import 'source-map-support/register';

import { AbstractDto } from '@common/dto/abstract.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PagingResponseDto } from '@common/dto/paging-response.dto';
import { AbstractEntity } from '@common/entities/abstract.entity';
import * as _ from 'lodash';
import { Brackets, QueryBuilder, SelectQueryBuilder } from 'typeorm';

declare global {
  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: unknown): Dto[];
    toPageDto<Dto extends AbstractDto>(this: T[], pageMetaDto: PageMetaDto, options?: unknown): PagingResponseDto<Dto>;
  }
}
declare module 'typeorm' {
  interface QueryBuilder<Entity> {
    searchByString(q: string, columnNames: string[]): this;
  }

  interface SelectQueryBuilder<Entity> {
    paginate(this: SelectQueryBuilder<Entity>, pageOptionsDto: PageOptionsDto): Promise<PagingResponseDto<Entity>>;
  }
}

Array.prototype.toDtos = function <Entity extends AbstractEntity<Dto>, Dto extends AbstractDto>(
  options?: unknown,
): Dto[] {
  return _.compact(_.map<Entity, Dto>(this as Entity[], (item) => item.toDto(options as never)));
};

QueryBuilder.prototype.searchByString = function (q, columnNames) {
  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`);
      }
    }),
  );

  this.setParameter('q', `%${q}%`);

  return this;
};

SelectQueryBuilder.prototype.paginate = async function <Entity>(
  this: SelectQueryBuilder<Entity>,
  pageOptionsDto: PageOptionsDto,
): Promise<PagingResponseDto<Entity>> {
  const [items, itemCount] = await this.skip(pageOptionsDto.skip).take(pageOptionsDto.take).getManyAndCount();

  return new PagingResponseDto(
    {
      pageOptionsDto,
      itemCount,
    },
    items,
  );
};

Array.prototype.toPageDto = function (pageMetaDto: PageMetaDto, options?: unknown) {
  return new PagingResponseDto(
    { pageOptionsDto: options as any, itemCount: pageMetaDto.itemCount },
    this.toDtos(options),
  );
};

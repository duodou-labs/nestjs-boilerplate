import { AbstractEntity } from '@common/entities/abstract.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DateTimeResolver } from 'graphql-scalars';

@ObjectType()
export abstract class AbstractDto {
  @ApiProperty()
  @Field(() => DateTimeResolver)
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Field(() => DateTimeResolver)
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Field(() => DateTimeResolver, { nullable: true })
  @Expose()
  deletedAt: Date;

  constructor(e: AbstractEntity) {
    this.createdAt = e.createdAt;
    this.updatedAt = e.updatedAt;
    this.deletedAt = e.deletedAt;
  }
}

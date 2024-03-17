import { type Constructor } from '@common/types/constructor.type';
import { Field, ObjectType } from '@nestjs/graphql';
import { TimestampResolver } from 'graphql-scalars';
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractDto } from '../dto/abstract.dto';

@ObjectType()
export abstract class AbstractEntity<DTO extends AbstractDto = AbstractDto, O = never> {
  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  @Field(() => TimestampResolver)
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
  })
  @Field(() => TimestampResolver)
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
  })
  @Field(() => TimestampResolver, { nullable: true })
  deletedAt: Date;

  private dtoClass?: Constructor<DTO, [AbstractEntity, O?]>;

  toDto(options?: O): DTO {
    const dtoClass = this.dtoClass;

    if (!dtoClass) {
      throw new Error(`You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`);
    }

    return new dtoClass(this, options);
  }
}

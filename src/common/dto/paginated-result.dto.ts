import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

export function PaginatedResult<T>(classRef: Type<T>): any {
  @ObjectType()
  abstract class PageResponseClass<T> {
    @ApiProperty()
    @Field(() => Int, { description: 'Current page that records were queried' })
    readonly page: number;

    @ApiProperty()
    @Field(() => Int, { description: 'The maximum records will be displayed on each of the pages' })
    readonly take: number;

    @ApiProperty()
    @Field(() => Int, { description: 'The maximum records found' })
    readonly itemCount: number;

    @ApiProperty()
    @Field(() => Int, { description: 'The total page count' })
    readonly pageCount: number;

    @ApiProperty()
    @Field(() => Boolean)
    readonly hasPreviousPage: boolean;

    @ApiProperty()
    @Field(() => Boolean)
    readonly hasNextPage: boolean;

    @ApiProperty({ type: () => Array<T> })
    @Field(() => [classRef], { description: 'A list of data' })
    data: T[];
  }

  return PageResponseClass;
}

import { Field, ObjectType } from '@nestjs/graphql';
import { Brand } from '../enums/brand.enum';

@ObjectType()
export class MotocycleDto {
  @Field(() => Brand)
  brand: Brand;
}

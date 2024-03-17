import { Field, ObjectType } from '@nestjs/graphql';
import { Brand } from '../enums/brand.enum';

@ObjectType()
export class ProductDto {
  @Field(() => String)
  name: string;

  @Field(() => Brand)
  brand: Brand;
}

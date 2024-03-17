import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class TokenDto {
  @IsString({ message: 'The new access token' })
  @Field(() => String)
  accessToken: string;

  @IsString({ message: 'The new refresh token' })
  @Field(() => String)
  refreshToken: string;
}

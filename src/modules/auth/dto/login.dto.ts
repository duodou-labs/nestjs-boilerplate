import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { EmailAddressResolver } from 'graphql-scalars';

@InputType()
export class LoginDto {
  @IsString({ message: 'email must be string' })
  @Field(() => EmailAddressResolver)
  email: string;

  @IsString({ message: 'email must be string' })
  @Field(() => String)
  password: string;
}

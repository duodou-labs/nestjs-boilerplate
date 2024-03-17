import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';
import { EmailAddressResolver } from 'graphql-scalars';

@InputType()
export class RegisterDto {
  @IsEmail()
  @Field(() => EmailAddressResolver)
  email: string;

  @IsString()
  @Field(() => String)
  firstName: string;

  @IsString()
  @Field(() => String)
  lastName: string;

  @IsString()
  @Field(() => String)
  password: string;
}

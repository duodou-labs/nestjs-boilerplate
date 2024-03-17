import { AbstractDto } from '@common/dto/abstract.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '@users/user.entity';
import { EmailAddressResolver, UUIDResolver } from 'graphql-scalars';

@ObjectType()
export class UserDto extends AbstractDto {
  @Field(() => UUIDResolver)
  id: string;

  @Field(() => EmailAddressResolver)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  constructor(e: UserEntity) {
    super(e);
    this.id = e.id;
    this.email = e.email;
    this.firstName = e.firstName;
    this.lastName = e.lastName;
  }
}

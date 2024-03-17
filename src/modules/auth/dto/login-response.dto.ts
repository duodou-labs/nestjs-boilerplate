import { ObjectType } from '@nestjs/graphql';
import { TokenDto } from './refresh-token.dto';

@ObjectType()
export class LoginResponseDto extends TokenDto {}

import { PaginatedResult } from '@common/dto/paginated-result.dto';
import { ObjectType } from '@nestjs/graphql';
import { UserDto } from './user.dto';

@ObjectType()
export class UserPage extends PaginatedResult(UserDto) {}

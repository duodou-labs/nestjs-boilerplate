import { Args, Query, Resolver } from '@nestjs/graphql';

import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PagingResponseDto } from '@common/dto/paging-response.dto';
import { UserPage } from './dto/user-page.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './user.service';

@Resolver()
export class UsersResolver {
  constructor(private _service: UsersService) {}

  @Query(() => UserPage)
  getUsers(@Args('queryParams', { nullable: true }) queryParams: PageOptionsDto): Promise<PagingResponseDto<UserDto>> {
    return this._service.getUsers(queryParams);
  }
}

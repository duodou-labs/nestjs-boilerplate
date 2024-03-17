import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';
import { UsersResolver } from './user.resolver';
import { UsersService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UsersResolver, UserRepository],
  controllers: [UsersController],
  exports: [UserRepository],
})
export class UsersModule {}

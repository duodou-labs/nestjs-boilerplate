import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../base/base.repository';
import { UserEntity } from './user.entity';

export class UserRepository extends BaseRepository<UserEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, UserEntity);
  }
}

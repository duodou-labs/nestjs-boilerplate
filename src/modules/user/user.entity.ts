import { AbstractEntity } from '@common/entities/abstract.entity';
import { UseDto } from '@decorators/use-dto.decorator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UserDto } from './dto/user.dto';

@UseDto(UserDto)
@Entity('users')
export class UserEntity extends AbstractEntity<UserDto> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column()
  passwordHash: string;

  @Column()
  salt: string;
}

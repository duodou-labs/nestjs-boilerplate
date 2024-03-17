import { PaginatedResult } from '@common/dto/paginated-result.dto';
import { ObjectType } from '@nestjs/graphql';
import { MotocycleDto } from './motocyle.dto';

@ObjectType()
export class MotocyclePage extends PaginatedResult(MotocycleDto) {}

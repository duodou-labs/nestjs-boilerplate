import { Module } from '@nestjs/common';
import { MotocycleResolver } from './motocycle.resolver';
import { MotocycleService } from './motocycle.service';
import { ProductLoader } from './product.loader';

@Module({
  providers: [ProductLoader, MotocycleResolver, MotocycleService],
})
export class MotocycleModule {}

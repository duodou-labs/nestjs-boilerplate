import { Module } from '@nestjs/common';
import { MotocycleModule } from './motocycle/motocycle.module';

@Module({
  imports: [MotocycleModule],
})
export class ExampleModule {}

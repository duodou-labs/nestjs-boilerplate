import { NestDataLoader } from '@common/interfaces/dataloader.interface';
import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { ProductDto } from './dto/product.dto';
import { Brand } from './enums/brand.enum';
import { MotocycleService } from './motocycle.service';

@Injectable()
export class ProductLoader implements NestDataLoader<string, ProductDto[]> {
  constructor(private readonly _service: MotocycleService) {}

  generateDataLoader(): DataLoader<string, ProductDto[]> {
    return new DataLoader<string, ProductDto[]>(async (keys: Brand[]) => await this._service.getProductsByBrands(keys));
  }
}

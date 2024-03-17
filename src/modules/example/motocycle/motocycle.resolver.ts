import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PagingResponseDto } from '@common/dto/paging-response.dto';
import { Public } from '@decorators/public.decorator';
import { UseInterceptors } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { DataLoaderInterceptor, Loader } from 'src/interceptors/nest-dataloader.interceptor';
import { MotocyclePage } from './dto/motocyle-page.dto';
import { MotocycleDto } from './dto/motocyle.dto';
import { ProductDto } from './dto/product.dto';
import { MotocycleService } from './motocycle.service';
import { ProductLoader } from './product.loader';

@UseInterceptors(DataLoaderInterceptor)
@Resolver(MotocycleDto)
export class MotocycleResolver {
  constructor(private readonly _service: MotocycleService) {}

  @ResolveField('products', () => [ProductDto])
  getProducts(
    @Parent() motocycle: MotocycleDto,
    @Loader(ProductLoader) loader: DataLoader<MotocycleDto['brand'], ProductDto[]>,
  ): Promise<ProductDto[]> {
    return loader.load(motocycle.brand);
  }

  @Public()
  @Query(() => MotocyclePage)
  getMotocycles(
    @Args('queryParams', { nullable: true }) queryParams: PageOptionsDto,
  ): Promise<PagingResponseDto<MotocycleDto>> {
    return this._service.getMotocycles(queryParams);
  }
}

import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PagingResponseDto } from '@common/dto/paging-response.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { groupBy } from '@providers/utils.service';
import { MotocycleDto } from './dto/motocyle.dto';
import { ProductDto } from './dto/product.dto';
import { Brand } from './enums/brand.enum';

const motocycles: MotocycleDto[] = [
  {
    brand: Brand.HONDA,
  },
  {
    brand: Brand.YAMAHA,
  },
];

const products = [
  {
    name: 'NVX 155 VVA',
    brand: Brand.YAMAHA,
  },
  {
    name: 'AB 125',
    brand: Brand.HONDA,
  },
  {
    name: 'Sirus',
    brand: Brand.YAMAHA,
  },
  {
    name: 'AB 160',
    brand: Brand.HONDA,
  },
  {
    name: 'SH 350i',
    brand: Brand.HONDA,
  },
];

@Injectable()
export class MotocycleService {
  async getMotocycles(options: PageOptionsDto): Promise<PagingResponseDto<MotocycleDto>> {
    try {
      return new PagingResponseDto(
        {
          pageOptionsDto: options,
          itemCount: motocycles.length,
        },
        motocycles,
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  getProductsByBrands(brands: Brand[]): ProductDto[][] {
    const groupProducts: Record<Brand, ProductDto[]> = groupBy(products, (product) => product.brand);

    return brands.map((brand) => groupProducts[brand]);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';
import { PageOptionsDto } from './page-options.dto';

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PagingResponseDto<T> extends PageMetaDto {
  @IsArray({ each: true })
  @ApiProperty()
  data: T[];

  constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters, data: T[]) {
    super({ pageOptionsDto, itemCount });
    this.data = data;
  }
}

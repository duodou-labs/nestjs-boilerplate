import { BooleanEnum } from '@common/enums/boolean.enum';
import { Sort } from '@common/enums/sort.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class PageOptionsDto {
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_TAKE = 30;
  public static readonly MIN_TAKE = 1;
  public static readonly MAX_TAKE = 100;

  @ApiPropertyOptional({
    enum: Sort,
    default: Sort.DESC,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? value : Sort.DESC))
  @IsEnum(Sort)
  @Field(() => Sort, {
    defaultValue: Sort.DESC,
    description: 'The order of the records',
    nullable: true,
  })
  readonly order: Sort = Sort.DESC;

  @ApiPropertyOptional({
    description: `Min: ${PageOptionsDto.DEFAULT_PAGE}`,
    default: PageOptionsDto.DEFAULT_PAGE,
  })
  @IsOptional()
  @Transform(({ value }) => (value < PageOptionsDto.DEFAULT_PAGE ? +PageOptionsDto.DEFAULT_PAGE : +value))
  @IsInt()
  @Min(PageOptionsDto.DEFAULT_PAGE)
  @Field(() => Int, {
    defaultValue: PageOptionsDto.DEFAULT_PAGE,
    description: 'Current page that records will be queried',
    nullable: true,
  })
  readonly page: number = PageOptionsDto.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: `Min: ${PageOptionsDto.MIN_TAKE} - Max: ${PageOptionsDto.MAX_TAKE}`,
    default: PageOptionsDto.DEFAULT_TAKE,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value < PageOptionsDto.MIN_TAKE || value > PageOptionsDto.MAX_TAKE ? +PageOptionsDto.DEFAULT_TAKE : +value,
  )
  @IsInt()
  @Min(PageOptionsDto.MIN_TAKE)
  @Max(PageOptionsDto.MAX_TAKE)
  @Field(() => Int, {
    defaultValue: PageOptionsDto.DEFAULT_TAKE,
    description: 'The quantity of records',
    nullable: true,
  })
  readonly take: number = PageOptionsDto.DEFAULT_TAKE;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Field(() => String, {
    nullable: true,
    description: 'The search text will be applied',
  })
  readonly q?: string;

  @ApiPropertyOptional({ enum: BooleanEnum })
  @IsOptional()
  @Field(() => BooleanEnum, { nullable: true, description: 'Set value for this to query the soft deleted records' })
  @Transform(({ value }) => `${value}` === BooleanEnum.TRUE)
  @IsBoolean()
  @Field(() => BooleanEnum, {
    nullable: true,
    description: 'Set value for this to query the soft deleted records',
  })
  readonly isDeleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @Field(() => [String], {
    nullable: true,
    description: `A list of record's IDs`,
  })
  ids?: string[];

  @ApiPropertyOptional({ enum: BooleanEnum })
  @IsOptional()
  @Transform(({ value }) => `${value}` === BooleanEnum.TRUE)
  @IsBoolean()
  @Field(() => BooleanEnum, {
    nullable: true,
    description: 'Enable to TRUE to query all of the records',
  })
  readonly selectAll?: boolean;
}

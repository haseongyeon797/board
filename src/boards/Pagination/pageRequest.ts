import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortType {
  LATEST = 'latest',
  OLDEST = 'oldest',
  VIEWS = 'views',
}

export class PageRequest {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNo?: number = 1;

  @ApiPropertyOptional({ description: '제목 검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: SortType,
    default: SortType.LATEST,
  })
  @IsOptional()
  @IsEnum(SortType)
  sort?: SortType = SortType.LATEST;
}

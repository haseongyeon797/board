import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BoardStatus } from '../boards.model';

export class UpdateBoardDto {
  @ApiProperty({ description: '게시물 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '게시물 내용' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: '공개 상태', enum: BoardStatus })
  @IsEnum(BoardStatus)
  status: BoardStatus;
}

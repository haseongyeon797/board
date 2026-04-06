import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: '게시물 제목', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: '게시물 내용', maxLength: 50000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  description: string;
}

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BoardStatus } from '../boards.model';

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(BoardStatus)
  status: BoardStatus;
}

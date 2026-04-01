import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Board } from './boards.model';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PageRequest } from './Pagination/pageRequest';
import { Page } from './Pagination/page';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  async getAllboards(
    @CurrentUser('sub') userId: number,
    @Query() pageRequest: PageRequest,
  ): Promise<Page<Board>> {
    return this.boardsService.getAllboards(userId, pageRequest.pageNo ?? 1);
  }

  @Post()
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Board> {
    return this.boardsService.createBoard(createBoardDto, userId);
  }

  @Get('/:id')
  async getBoardById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: number,
  ): Promise<Board> {
    return this.boardsService.getBoardById(id, userId);
  }

  @Delete('/:id')
  async deleteBoard(
    @Param('id') id: string,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.boardsService.deleteBoard(id, userId);
  }

  @Patch('/:id')
  async updateBoard(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Board> {
    return this.boardsService.updateBoard(id, userId, dto);
  }
}

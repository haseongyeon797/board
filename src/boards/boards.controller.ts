import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Board } from './boards.model';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PageRequest } from './Pagination/pageRequest';
import { Page } from './Pagination/page';

@ApiTags('게시판')
@ApiBearerAuth()
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @ApiOperation({ summary: '게시물 목록 조회 (페이지네이션)' })
  async getAllboards(
    @CurrentUser('sub') userId: number,
    @Query() pageRequest: PageRequest,
  ): Promise<Page<Board>> {
    return this.boardsService.getAllboards(userId, pageRequest.pageNo ?? 1);
  }

  @Post()
  @ApiOperation({ summary: '게시물 작성' })
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Board> {
    return this.boardsService.createBoard(createBoardDto, userId);
  }

  @Get('/:id')
  @ApiOperation({ summary: '게시물 상세 조회 (조회수 증가 포함)' })
  async getBoardById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') viewerId: number,
  ): Promise<Board> {
    const board = await this.boardsService.getBoardById(id, viewerId);
    if (Number(board.authorId) !== Number(viewerId)) {
      await this.boardsService.incrementViewcount(id);
    }
    return board;
  }

  @Delete('/:id')
  @ApiOperation({ summary: '게시물 삭제 (작성자만 가능)' })
  async deleteBoard(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.boardsService.deleteBoard(id, userId);
  }

  @Patch('/:id')
  @ApiOperation({ summary: '게시물 수정 (작성자만 가능)' })
  async updateBoard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Board> {
    return this.boardsService.updateBoard(id, userId, dto);
  }
}

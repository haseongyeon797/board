import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CommentItem } from './comments.model';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('댓글')
@ApiBearerAuth()
@Controller('boards/:boardId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: '댓글 목록 조회' })
  async list(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @CurrentUser('sub') userId: number,
  ): Promise<CommentItem[]> {
    return this.commentsService.findByBoard(boardId, userId);
  }

  @Post()
  @ApiOperation({ summary: '댓글 작성 (익명 선택 가능)' })
  async create(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('sub') userId: number,
  ): Promise<CommentItem> {
    return this.commentsService.create(boardId, dto, userId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: '댓글 수정 (작성자만 가능)' })
  async update(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('sub') userId: number,
  ): Promise<CommentItem> {
    return this.commentsService.update(boardId, commentId, userId, dto);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: '댓글 삭제 — soft delete (작성자만 가능)' })
  async remove(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.commentsService.delete(boardId, commentId, userId);
  }
}

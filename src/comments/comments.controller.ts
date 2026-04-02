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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CommentItem } from './comments.model';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('boards/:boardId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async list(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @CurrentUser('sub') userId: number,
  ): Promise<CommentItem[]> {
    return this.commentsService.findByBoard(boardId, userId);
  }

  @Post()
  async create(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('sub') userId: number,
  ): Promise<CommentItem> {
    return this.commentsService.create(boardId, dto, userId);
  }

  @Patch(':commentId')
  async update(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('sub') userId: number,
  ): Promise<CommentItem> {
    return this.commentsService.update(boardId, commentId, userId, dto);
  }

  @Delete(':commentId')
  async remove(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.commentsService.delete(boardId, commentId, userId);
  }
}

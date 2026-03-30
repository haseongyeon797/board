import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from '../boards/boards.service';
import type { CommentItem } from './comments.model';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly boardsService: BoardsService,
  ) {}

  async findByBoard(boardId: string, viewerId: number): Promise<CommentItem[]> {
    await this.boardsService.getBoardById(boardId, viewerId);
    const rows = await this.commentRepo.find({
      where: { board: { id: boardId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
    return rows.map((c) => this.toItem(c));
  }

  async create(
    boardId: string,
    dto: CreateCommentDto,
    authorId: number,
  ): Promise<CommentItem> {
    await this.boardsService.getBoardById(boardId, authorId);
    const comment = this.commentRepo.create({
      content: dto.content,
      board: { id: boardId },
      author: { id: authorId },
    });
    const saved = await this.commentRepo.save(comment);
    const withAuthor = await this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['author'],
    });
    if (!withAuthor) {
      throw new NotFoundException('Comment not found after create');
    }
    return this.toItem(withAuthor);
  }

  async delete(
    boardId: string,
    commentId: string,
    userId: number,
  ): Promise<void> {
    await this.boardsService.getBoardById(boardId, userId);
    const comment = await this.commentRepo.findOne({
      where: { id: commentId, board: { id: boardId } },
    });
    if (!comment) {
      throw new NotFoundException(`Comment "${commentId}" not found`);
    }
    if (Number(comment.authorId) !== Number(userId)) {
      throw new ForbiddenException('본인이 작성한 댓글만 삭제할 수 있습니다.');
    }
    await this.commentRepo.delete(commentId);
  }

  private toItem(c: Comment): CommentItem {
    const author = c.author;
    if (!author) {
      throw new Error('Comment author not loaded');
    }
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      authorId: c.authorId,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
      },
    };
  }
}

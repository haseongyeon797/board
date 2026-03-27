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
  //comment repository와 boardsService를 주입받음
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly boardsService: BoardsService,
  ) {}

  async findByBoard(boardId: string, viewerId: number): Promise<CommentItem[]> {
    //boardId와 viewerId로 게시물 가져와서 board id가 author인지 확인하고 오름차순으로 정렬
    await this.boardsService.getBoardById(boardId, viewerId);
    const rows = await this.commentRepo.find({
      where: { board: { id: boardId } },
      relations: ['author'], //작성자 정보도 알아야하니까 가져옴
      order: { createdAt: 'ASC' },
    });
    return rows.map((c) => this.toItem(c)); //comment 객체를 매핑함 낄끔하게
  }

  async create(
    boardId: string,
    dto: CreateCommentDto,
    authorId: number,
  ): Promise<CommentItem> {
    await this.boardsService.getBoardById(boardId, authorId); //boardId와 authorId로 게시물 가져옴 게시물이 존재하는지 권한이 있는지 확인
    const comment = this.commentRepo.create({
      //comment 객체 생성
      content: dto.content,
      board: { id: boardId },
      author: { id: authorId },
    });
    const saved = await this.commentRepo.save(comment); //comment 저장
    const withAuthor = await this.commentRepo.findOne({
      //저장 이후에 정보가 없을수도 있으니 가져옴
      where: { id: saved.id },
      relations: ['author'],
    });
    if (!withAuthor) {
      throw new NotFoundException('Comment not found after create'); //comment 하나 못찾았을 때 예외 발생
    }
    return this.toItem(withAuthor);
  }

  async delete(
    boardId: string,
    commentId: string,
    userId: number,
  ): Promise<void> {
    await this.boardsService.getBoardById(boardId, userId); //게시물이 존재하는지 userId가 권한이 있는지 확인
    const comment = await this.commentRepo.findOne({
      //이 댓글이 게시판에 존재하는지 확인
      where: { id: commentId, board: { id: boardId } },
    });
    if (!comment) {
      throw new NotFoundException(`Comment "${commentId}" not found`); //comment 없음
    }
    if (Number(comment.authorId) !== Number(userId)) {
      throw new ForbiddenException('본인이 작성한 댓글만 삭제할 수 있습니다.'); //쓴사람과 현재 유저가 다름
    }
    await this.commentRepo.delete(commentId); //comment 삭제
  }

  private toItem(c: Comment): CommentItem {
    //comment를 commentitem으로 변환 매핑을 하는 이유는 필요 없는 내용이 들어갈수도 있으니가 매핑을 하여 일관성 있고 필요한 내용만 가져오기 위해
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

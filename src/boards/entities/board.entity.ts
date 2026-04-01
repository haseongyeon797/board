import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { User } from '../../user/entities/user.entity';
import { BoardStatus } from '../boards.model';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: BoardStatus,
    default: BoardStatus.PUBLIC,
  })
  status: BoardStatus;

  @Column({ default: 0 })
  viewCount: number;

  @ManyToOne(() => User, (user) => user.boards, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @RelationId((board: Board) => board.author)
  authorId: number;

  @OneToMany(() => Comment, (comment) => comment.board)
  comments: Comment[];
}

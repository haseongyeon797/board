import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../user/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Board, (board) => board.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @RelationId((comment: Comment) => comment.board)
  boardId: string;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @RelationId((comment: Comment) => comment.author)
  authorId: number;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'boolean', default: false })
  isdeleted: boolean;

  @Column({ type: 'boolean', default: false })
  isUpdated: boolean;
}

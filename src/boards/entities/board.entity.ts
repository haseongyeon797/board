import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
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

  @ManyToOne(() => User, (user) => user.boards, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @RelationId((board: Board) => board.author)
  authorId: number;
}

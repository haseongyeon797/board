import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Board } from '../entities/board.entity';

export enum RecommendationType {
  RECOMMEND = 'RECOMMEND',
  NOT_RECOMMEND = 'NOT_RECOMMEND',
}

@Entity('board_recommendations')
@Unique(['user', 'board'])
export class BoardRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @RelationId((rec: BoardRecommendation) => rec.user)
  userId: number;

  @ManyToOne(() => Board, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @RelationId((rec: BoardRecommendation) => rec.board)
  boardId: string;

  @Column({ type: 'enum', enum: RecommendationType })
  type: RecommendationType;
}

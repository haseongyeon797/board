import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Board } from '../../boards/entities/board.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: true })
  githubId: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Board, (board) => board.author)
  boards: Board[];
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BoardRecommendation,
  RecommendationType,
} from './recommendation.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(BoardRecommendation)
    private readonly recRepo: Repository<BoardRecommendation>,
  ) {}

  async toggle(
    boardId: string,
    userId: number,
    type: RecommendationType,
  ): Promise<{
    action: 'created' | 'deleted' | 'changed';
    type: RecommendationType | null;
  }> {
    const existing = await this.recRepo.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
    });

    if (!existing) {
      const rec = this.recRepo.create({
        board: { id: boardId },
        user: { id: userId },
        type,
      });
      await this.recRepo.save(rec);
      return { action: 'created', type };
    }

    if (existing.type === type) {
      await this.recRepo.delete(existing.id);
      return { action: 'deleted', type: null };
    }

    existing.type = type;
    await this.recRepo.save(existing);
    return { action: 'changed', type };
  }

  async getCount(
    boardId: string,
  ): Promise<{ recommend: number; notRecommend: number }> {
    const [recommend, notRecommend] = await Promise.all([
      this.recRepo.count({
        where: {
          board: { id: boardId },
          type: RecommendationType.RECOMMEND,
        },
      }),
      this.recRepo.count({
        where: {
          board: { id: boardId },
          type: RecommendationType.NOT_RECOMMEND,
        },
      }),
    ]);
    return { recommend, notRecommend };
  }

  async getStatus(
    boardId: string,
    userId: number,
  ): Promise<RecommendationType | null> {
    const rec = await this.recRepo.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
    });
    return rec ? rec.type : null;
  }
}

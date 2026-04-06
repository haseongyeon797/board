import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecommendationService } from './recommendation.service';
import { RecommendationType } from './recommendation.entity';

@Controller('boards/:boardId/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recService: RecommendationService) {}

  @Post()
  async toggle(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Query('type') type: RecommendationType,
    @CurrentUser('sub') userId: number,
  ) {
    return this.recService.toggle(boardId, userId, type);
  }

  @Get()
  async getStatus(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @CurrentUser('sub') userId: number,
  ) {
    const [count, myStatus] = await Promise.all([
      this.recService.getCount(boardId),
      this.recService.getStatus(boardId, userId),
    ]);
    return { ...count, myStatus };
  }
}

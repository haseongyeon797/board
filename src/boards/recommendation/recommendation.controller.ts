import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecommendationService } from './recommendation.service';
import { RecommendationType } from './recommendation.entity';

@ApiTags('추천/비추천')
@ApiBearerAuth()
@Controller('boards/:boardId/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly recService: RecommendationService) {}

  @Post()
  @ApiOperation({ summary: '추천/비추천 토글 (등록·취소·변경)' })
  @ApiQuery({ name: 'type', enum: RecommendationType })
  async toggle(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Query('type') type: RecommendationType,
    @CurrentUser('sub') userId: number,
  ) {
    return this.recService.toggle(boardId, userId, type);
  }

  @Get()
  @ApiOperation({ summary: '추천/비추천 수 및 내 상태 조회' })
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

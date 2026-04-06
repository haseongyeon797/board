import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { BoardsModule } from '../boards/boards.module';
import { Board } from '../boards/entities/board.entity';
import { CommentsModule } from '../comments/comments.module';
import { Comment } from '../comments/entities/comment.entity';
import { RecommendationModule } from '../boards/recommendation/recommendation.module';
import { BoardRecommendation } from '../boards/recommendation/recommendation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(config.get('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'board'),
        entities: [User, Board, Comment, BoardRecommendation],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    BoardsModule,
    CommentsModule,
    RecommendationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

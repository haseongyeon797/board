import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Board } from './boards.model';
import { BoardStatus } from './boards.model';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardRepository } from './repository/board.repository';
import { Page } from './Pagination/page';

const PAGE_SIZE = 5;

const boardListSelect = [
  //b는 board a는 author const로 선언하기
  'b.id',
  'b.title',
  'b.description',
  'b.status',
  'b.viewCount',
  'b.authorId',
  'a.id',
  'a.name',
  'a.email',
  'a.createdAt',
] as const;

const visibilityClause = //가시성절 누가 이 게시물을 보게 할것인가를 정함
  '(b.status = :pubStatus OR (b.status = :privStatus AND b.authorId = :viewerId))'; //공개 또는 (status가 비공개이고 authorId가 viewerId와 같으면)

@Injectable()
export class BoardsService {
  constructor(private readonly boardRepo: BoardRepository) {}

  async getAllboards(viewerId: number, pageNo: number): Promise<Page<Board>> {
    const [items, totalCount] = await this.boardRepo
      .createQueryBuilder('b') //복잡한 쿼리를 짜야할때 사용
      .leftJoinAndSelect('b.author', 'a') //b와 a를 조인해서 결과를 가져옴 조인: 테이블 합쳐서 의미있는것만 select함
      .select([...boardListSelect]) //boardListSelect에 있는 컬럼만 select함
      .where(visibilityClause, {
        pubStatus: BoardStatus.PUBLIC, //파라미터 바인딩 객체 초기 상태 설정
        privStatus: BoardStatus.PRIVATE,
        viewerId,
      })
      .orderBy('b.id', 'ASC') //id 기준 오름차순 정렬
      .skip((pageNo - 1) * PAGE_SIZE) //건너뛸 항목 수
      .take(PAGE_SIZE) //가져올 항목 수
      .getManyAndCount(); //결과와 전체 개수를 함께 가져옴

    return new Page(totalCount, PAGE_SIZE, items);
  }

  async createBoard(dto: CreateBoardDto, authorId: number): Promise<Board> {
    const board = this.boardRepo.create({
      //board 객체 생성
      title: dto.title, //dto에서 title, description, status, authorId 가져옴
      description: dto.description,
      status: BoardStatus.PUBLIC,
      author: { id: authorId },
    });
    const saved = await this.boardRepo.save(board); //저장
    return this.getBoardById(saved.id, authorId); //방금 저장된 id랑 지금 내가 로그인한 id를 가져와서 게시물 가져옴
  }

  async getBoardById(id: string, viewerId: number): Promise<Board> {
    //id랑 viewerId를 가져와서 게시물 가져옴
    const board = await this.boardRepo
      .createQueryBuilder('b') //위와 같음
      .leftJoinAndSelect('b.author', 'a')
      .select([...boardListSelect])
      .where('b.id = :id', { id }) //id가 id와 같은 게시물 찾기
      .andWhere(visibilityClause, {
        pubStatus: BoardStatus.PUBLIC,
        privStatus: BoardStatus.PRIVATE,
        viewerId,
      })
      .getOne(); //결과를 하나만 가져옴
    if (!board) {
      //결과가 없으면 오류 반환
      throw new NotFoundException(`Board "${id}" not found`);
    }
    return board;
  }

  async incrementViewcount(id: string): Promise<void> {
    await this.boardRepo.increment({ id }, 'viewCount', 1);
  }

  async deleteBoard(id: string, userId: number): Promise<void> {
    //id랑 userId를 가져와서 게시물 삭제
    await this.assertAuthor(id, userId); //작성자와 로그인한 사람 비교 같은사람인지
    await this.boardRepo.delete(id);
  }

  async updateBoard(
    //id랑 userId를 가져와서 게시물 업데이트 dto는 업데이트할 내용
    id: string,
    userId: number,
    dto: UpdateBoardDto,
  ): Promise<Board> {
    const board = await this.assertAuthor(id, userId);
    board.title = dto.title;
    board.description = dto.description;
    board.status = dto.status;
    await this.boardRepo.save(board);
    return this.getBoardById(id, userId);
  }

  private async assertAuthor(id: string, userId: number): Promise<Board> {
    const board = await this.boardRepo.findOne({ where: { id } });
    if (!board) {
      throw new NotFoundException(`Board "${id}" not found`);
    }
    if (Number(board.authorId) !== Number(userId)) {
      throw new ForbiddenException('작성자만 수정·삭제할 수 있습니다.');
    }
    return board;
  }
}

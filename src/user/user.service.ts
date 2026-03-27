import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {} //user repository 가져옴

  createUser(name: string, email: string) {
    //name이랑 email 인자로 받아와서 saveUser에 넣어 return함 ''이건 머지
    return this.userRepository.saveUser(name, email, '');
  }

  getUsers() {
    //findAllUsers 호출해서 모든 user 읽기
    return this.userRepository.findAllUsers();
  }

  async createWithPasswordHash(
    //비동기 함수 나머지랑 상관없이 saveUser return
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    return this.userRepository.saveUser(name, email, passwordHash);
  }

  async findByEmail(email: string): Promise<User | null> {
    //email로 유저 찾는데 만약에 없으면 null을 반환
    return this.userRepository.findByEmail(email);
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    //githubId로 유저 찾기
    return this.userRepository.findByGithubId(githubId);
  }

  async linkGithubAccount(userId: number, githubId: string): Promise<User> {
    //userid랑 githubid 매치해서 업데이트 만약 업데이트가 안됐으면 userid가 안찾아진다고 오류 반환
    const updated = await this.userRepository.updateUser(userId, { githubId });
    if (!updated) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return updated;
  }

  async createFromGithub(
    //create github 버전
    name: string,
    email: string,
    githubId: string,
  ): Promise<User> {
    return this.userRepository.saveGithubUser(name, email, githubId);
  }

  async findAll() {
    return this.userRepository.findAllUsers(); //모든 user 읽기
  }

  async findOne(id: number) {
    //unique id로 유저찾기 +에러 핸들링
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    //updateUserDto 가져와서 id로 찾은거 업데이트
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return this.userRepository.updateUser(id, updateUserDto);
  }

  async delete(id: number) {
    //unique id로 유저 찾아서 delete함
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    await this.userRepository.deleteUser(id);
  }
}

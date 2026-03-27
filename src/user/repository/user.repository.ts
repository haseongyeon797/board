import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveUser(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      githubId: null,
    });
    return this.userRepository.save(user);
  }

  async saveGithubUser(
    name: string,
    email: string,
    githubId: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      name,
      email,
      githubId,
      passwordHash: null,
    });
    return this.userRepository.save(user);
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { githubId } });
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: number, partial: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, partial);
    return this.findUserById(id);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

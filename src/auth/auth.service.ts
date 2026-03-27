import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-github2';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AuthProvider, LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor( //user service와 jwt service 가져옴
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, apiPublicBaseUrl: string) { 
    const provider = loginDto.provider ?? AuthProvider.LOCAL;

    if (provider === AuthProvider.GITHUB) {
      const base = apiPublicBaseUrl.replace(/\/$/, '');
      return {
        flow: 'oauth_github',
        message:
          '브라우저에서 authorizeUrl로 이동해 GitHub 로그인을 완료하세요.',
        authorizeUrl: `${base}/auth/github/login`,
      };
    }

    const email = loginDto.email;
    const password = loginDto.password;
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }

    const user = await this.userService.findByEmail(email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.buildAuthResponse(user);
  }

  buildAuthResponse(user: User) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.passwordConfirm) {
      throw new BadRequestException('비밀번호 확인이 일치하지 않습니다.');
    }

    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.createWithPasswordHash(
      registerDto.name,
      registerDto.email,
      passwordHash,
    );

    return this.buildAuthResponse(user);
  }

  async validateGithubUser(profile: Profile): Promise<User> {
    const githubId = String(profile.id);
    const name =
      profile.displayName?.trim() || profile.username || 'GitHub 사용자';

    const email =
      profile.emails?.[0]?.value?.trim() ||
      (profile.username
        ? `${profile.username}@users.noreply.github.com`
        : `github-${githubId}@oauth.local`);

    const byGithub = await this.userService.findByGithubId(githubId);
    if (byGithub) {
      return byGithub;
    }

    const byEmail = await this.userService.findByEmail(email);
    if (byEmail) {
      if (byEmail.githubId && byEmail.githubId !== githubId) {
        throw new ConflictException(
          '이 이메일은 다른 GitHub 계정과 이미 연결되어 있습니다.',
        );
      }
      return this.userService.linkGithubAccount(byEmail.id, githubId);
    }

    return this.userService.createFromGithub(name, email, githubId);
  }
}

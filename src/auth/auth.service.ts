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
  constructor(
    //user service와 jwt service 가져옴
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, apiPublicBaseUrl: string) {
    //로그인하기 위한 정보들과 apiPublicBaseUrl을 받음
    const provider = loginDto.provider ?? AuthProvider.LOCAL; //provider가 없으면 local로 설정

    if (provider === AuthProvider.GITHUB) {
      //provider가 github면 깃허브 로그인 페이지로 이동
      const base = apiPublicBaseUrl.replace(/\/$/, '');
      return {
        flow: 'oauth_github',
        message:
          '브라우저에서 authorizeUrl로 이동해 GitHub 로그인을 완료하세요.',
        authorizeUrl: `${base}/auth/github/login`, //슬래시가 제거된 url로 이동
      };
    }

    const email = loginDto.email; //이메일 정보 가져옴
    const password = loginDto.password; //비밀번호 정보 가져옴
    if (!email || !password) {
      //아매일과 비밀번호를 입력하지 않았을 때
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }

    const user = await this.userService.findByEmail(email);
    if (!user?.passwordHash) {
      //비밀번호 해시가 없을 때
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      //비밀번호 해시가 일치하지 않을 때
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.buildAuthResponse(user);
  }

  buildAuthResponse(user: User) {
    //access 토큰 생성하고 유저 정보 반환
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
    //회원가입하기 위한 정보들을 받음
    if (registerDto.password !== registerDto.passwordConfirm) {
      //비밀번호와 비밀번호 확인이 일치하지 않을 때
      throw new BadRequestException('비밀번호 확인이 일치하지 않습니다.');
    }

    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) {
      //이미 가입된 이메일이 있을 때
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10); //해시함수 10번 돌림
    const user = await this.userService.createWithPasswordHash(
      //비밀번호 해시 생성하고 유저 생성
      registerDto.name,
      registerDto.email,
      passwordHash,
    );

    return this.buildAuthResponse(user);
  }

  async validateGithubUser(profile: Profile): Promise<User> {
    const githubId = String(profile.id); //깃허브 id string으로 변환
    const name =
      profile.displayName?.trim() || profile.username || 'GitHub 사용자'; //별명 또는 이름 또는 깃허브 사용자로 이름 설정

    const email =
      profile.emails?.[0]?.value?.trim() || //trim은 문자열 양쪽의 공백을 제거하는 함수
      (profile.username
        ? `${profile.username}@users.noreply.github.com`
        : `github-${githubId}@oauth.local`); //깃허브 id로 이메일 생성

    const byGithub = await this.userService.findByGithubId(githubId);
    if (byGithub) {
      //깃허브 id로 유저 찾기
      return byGithub;
    }

    const byEmail = await this.userService.findByEmail(email);
    if (byEmail) {
      //이메일로 유저 찾기
      if (byEmail.githubId && byEmail.githubId !== githubId) {
        //깃허브 id가 다른 경우
        throw new ConflictException(
          '이 이메일은 다른 GitHub 계정과 이미 연결되어 있습니다.',
        );
      }
      return this.userService.linkGithubAccount(byEmail.id, githubId); //깃허브 id와 이메일 연결
    }

    return this.userService.createFromGithub(name, email, githubId); //깃허브 유저 생성
  }
}

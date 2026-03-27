import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const proto = req.get('x-forwarded-proto') ?? req.protocol;
    const host = req.get('host') ?? 'localhost:3000';
    const apiPublicBaseUrl = `${proto}://${host}`;
    return this.authService.login(loginDto, apiPublicBaseUrl);
  }

  /** 회원가입 화면에서 GitHub → 가입 완료 문구용 */
  @Get('github/signup')
  githubSignup(@Req() req: Request, @Res() res: Response): void {
    req.session.githubOAuthFlow = 'signup';
    res.redirect(302, '/auth/github/authorize');
  }

  /** 로그인 화면에서 GitHub → 로그인 완료 문구용 */
  @Get('github/login')
  githubLoginEntry(@Req() req: Request, @Res() res: Response): void {
    req.session.githubOAuthFlow = 'login';
    res.redirect(302, '/auth/github/authorize');
  }

  /** 구 주소: 로그인 플로우와 동일 */
  @Get('github')
  githubLegacy(@Res() res: Response): void {
    res.redirect(302, '/auth/github/login');
  }

  @Get('github/authorize')
  @UseGuards(AuthGuard('github'))
  githubAuthorize(): void {
    /* Guard → GitHub */
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ): void {
    const flow = req.session.githubOAuthFlow ?? 'login';
    delete req.session.githubOAuthFlow;

    const headline =
      flow === 'signup' ? 'GitHub 가입 완료' : 'GitHub 로그인 완료';

    const { user, accessToken } = this.authService.buildAuthResponse(req.user);
    const frontendBase =
      this.configService.get<string>('FRONTEND_URL')?.trim() ||
      'http://localhost:8080';
    const redirectTo = frontendBase.replace(/\/$/, '') + '/index.html';

    const payload = JSON.stringify({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

    /** 3000번 포트의 localStorage는 8080과 공유되지 않음 → 해시로 프론트에 전달 */
    const bridgePayload = encodeURIComponent(
      JSON.stringify({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        oauthFlash: flow,
      }),
    );
    const redirectWithBridge = `${redirectTo}#t=${bridgePayload}`;

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${headline}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%);
      color: #e2e8f0;
    }
    .card {
      text-align: center;
      padding: 2.5rem 2rem;
      max-width: 22rem;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(34, 197, 94, 0.35);
      border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
    }
    .banner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.65rem 1rem;
      margin-bottom: 1.25rem;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.5);
      border-radius: 0.75rem;
      color: #86efac;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .icon {
      width: 3.5rem;
      height: 3.5rem;
      margin: 0 auto 1rem;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #fff;
    }
    h1 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.75rem;
      color: #f8fafc;
    }
    #welcome {
      font-size: 0.9rem;
      color: #a5b4fc;
      margin: 0 0 1rem;
      line-height: 1.5;
    }
    .hint {
      font-size: 0.75rem;
      color: #64748b;
    }
    .spinner {
      width: 1.5rem;
      height: 1.5rem;
      margin: 1rem auto 0;
      border: 2px solid rgba(34, 197, 94, 0.3);
      border-top-color: #4ade80;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="banner" role="status">${headline}</div>
    <div class="icon" aria-hidden="true">✓</div>
    <h1>로그인되었습니다</h1>
    <p id="welcome"></p>
    <p class="hint">홈 화면으로 이동합니다…</p>
    <div class="spinner" aria-hidden="true"></div>
  </div>
  <script>
    (function () {
      var p = ${payload};
      var el = document.getElementById('welcome');
      if (el && p.user && p.user.name) {
        el.textContent = p.user.name + '님, 환영합니다.';
      } else if (el) {
        el.textContent = '환영합니다.';
      }
      var next = ${JSON.stringify(redirectWithBridge)};
      setTimeout(function () {
        window.location.replace(next);
      }, 1600);
    })();
  </script>
</body>
</html>`;

    res.type('html').send(html);
  }
}

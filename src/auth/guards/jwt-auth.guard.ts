import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearer(request);
    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number | string;
        email: string;
      }>(token);
      const sub =
        typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
      request['user'] = { sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractBearer(request: Request): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return undefined;
    }
    return auth.slice(7).trim() || undefined;
  }
}

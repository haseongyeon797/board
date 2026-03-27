import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type JwtRequestUser = {
  sub: number;
  email: string;
};

type RequestWithJwtUser = Request & { user: JwtRequestUser };

export const CurrentUser = createParamDecorator(
  (
    key: keyof JwtRequestUser | undefined,
    ctx: ExecutionContext,
  ): JwtRequestUser | JwtRequestUser[keyof JwtRequestUser] => {
    const req = ctx.switchToHttp().getRequest<RequestWithJwtUser>();
    const user = req.user;
    return key ? user[key] : user;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserData = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<Request>().user
);

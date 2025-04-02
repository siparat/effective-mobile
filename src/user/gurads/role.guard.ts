import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { UserErrorMessages } from '../user.constants';
import { User, UserRole } from '@prisma/client';
import { Reflector } from '@nestjs/core';

export const AvialableRoles = Reflector.createDecorator<UserRole[]>();

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const handler = context.getHandler();
		const req = context.switchToHttp().getRequest<Request>();
		const user = req.user as User | undefined;
		const avialableRoles = this.reflector.get<UserRole[]>(AvialableRoles, handler);

		if (!user) {
			throw new NotFoundException(UserErrorMessages.NOT_FOUND);
		}

		if (avialableRoles && !!avialableRoles.length && !avialableRoles.includes(user.role)) {
			throw new ForbiddenException(UserErrorMessages.FORBIDDEN);
		}

		return true;
	}
}

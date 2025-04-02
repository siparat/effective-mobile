import { AuthGuard } from '@nestjs/passport';
import { AuthErrorMessages, AuthStrategyKey } from '../auth.constants';
import { JsonWebTokenError } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard(AuthStrategyKey.JWT) {
	override handleRequest<TUser>(
		err: unknown,
		user: false | string,
		info: undefined | JsonWebTokenError | Error,
		context: ExecutionContext
	): TUser {
		if (info instanceof JsonWebTokenError || info instanceof Error) {
			throw new UnauthorizedException(AuthErrorMessages.UNAUTHORIZED);
		}
		return super.handleRequest(err, user, info, context);
	}
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { getJwtStrategyConfig } from 'src/configs/jwt-strategy.config';
import { AuthErrorMessages, AuthStrategyKey } from '../auth.constants';
import { JwtPayload } from '../auth.interfaces';
import { UserRepository } from 'src/user/repositories/user.repository';
import { User } from '@prisma/client';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, AuthStrategyKey.JWT) {
	constructor(
		private userRepository: UserRepository,
		config: ConfigService
	) {
		const options = getJwtStrategyConfig(config);
		super(options);
	}

	async validate({ userId }: JwtPayload): Promise<User> {
		const user = await this.userRepository.getUserById(userId);
		if (!user) {
			throw new NotFoundException(AuthErrorMessages.NOT_FOUND);
		}
		return user;
	}
}

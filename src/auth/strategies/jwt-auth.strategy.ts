import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { getJwtStrategyConfig } from 'src/configs/jwt-strategy.config';
import { AuthStrategyKey } from '../auth.constants';
import { JwtPayload } from '../auth.interfaces';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, AuthStrategyKey.JWT) {
	constructor(config: ConfigService) {
		const options = getJwtStrategyConfig(config);
		super(options);
	}

	validate({ userId }: JwtPayload): boolean {
		return true;
	}
}

import { ConfigService } from '@nestjs/config';
import { ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';

export const getJwtStrategyConfig = (config: ConfigService): StrategyOptionsWithoutRequest => ({
	passReqToCallback: false,
	secretOrKey: config.getOrThrow('JWT_SECRET'),
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
});

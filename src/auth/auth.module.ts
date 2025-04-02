import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/configs/jwt.config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [JwtModule.registerAsync(getJwtConfig()), UserModule],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthStrategy],
	exports: [AuthService]
})
export class AuthModule {}

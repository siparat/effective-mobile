import { Body, Controller, Get, Post, UnprocessableEntityException, UseGuards, UsePipes } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { AuthErrorMessages } from './auth.constants';
import { LoginResponse } from './auth.interfaces';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserData } from 'src/user/decorators/user.decorator';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@UsePipes(ZodValidationPipe)
	@Post('register')
	async register(@Body() dto: RegisterDto): Promise<User> {
		return this.authService.register(dto);
	}

	@UsePipes(ZodValidationPipe)
	@Post('login')
	async login(@Body() { email, password }: LoginDto): Promise<LoginResponse> {
		const userEntity = await this.authService.validateUser(email, password);
		if (!userEntity.id) {
			throw new UnprocessableEntityException(AuthErrorMessages.WRONG_ENTITY);
		}
		const token = await this.authService.signToken(userEntity.id);
		return { token };
	}

	@UseGuards(JwtAuthGuard)
	@Get('info')
	getInfo(@UserData() user: User): User {
		return user;
	}
}

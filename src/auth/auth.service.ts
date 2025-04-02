import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from './auth.interfaces';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/repositories/user.repository';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthErrorMessages } from './auth.constants';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userRepository: UserRepository
	) {}

	async register({ email, password }: RegisterDto): Promise<User> {
		const alreadyExists = await this.userRepository.getUserByEmail(email);
		if (alreadyExists) {
			throw new ConflictException(AuthErrorMessages.ALREADY_EXISTS);
		}

		const userEntity = new UserEntity(email, '');
		await userEntity.setPassword(password);

		const user = await this.userRepository.createUser(userEntity);
		return user;
	}

	async validateUser(email: string, password: string): Promise<UserEntity> {
		const user = await this.userRepository.getUserByEmail(email);
		if (!user) {
			throw new NotFoundException(AuthErrorMessages.NOT_FOUND);
		}
		const userEntity = new UserEntity('', '');
		userEntity.setFromModel(user);
		const isCorrectPassword = await userEntity.comparePassword(password);
		if (!isCorrectPassword) {
			throw new BadRequestException(AuthErrorMessages.WRONG_PASSWORD);
		}
		return userEntity;
	}

	async signToken(userId: string): Promise<string> {
		const payload: JwtPayload = { userId };
		const token = await this.jwtService.signAsync(payload);
		return token;
	}
}

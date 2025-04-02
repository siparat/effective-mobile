import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
	constructor(private database: DatabaseService) {}

	async getUserById(userId: string): Promise<User | null> {
		const user = await this.database.user.findUnique({ where: { id: userId } });
		return user;
	}

	async getUserByEmail(email: string): Promise<User | null> {
		const user = await this.database.user.findUnique({ where: { email } });
		return user;
	}

	async createUser(userEntity: UserEntity): Promise<User> {
		try {
			const user = await this.database.user.create({ data: userEntity });
			return user;
		} catch (error) {
			Logger.error('Ошибка при создании пользователя:', error);
			throw error;
		}
	}
}

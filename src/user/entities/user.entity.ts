import { User, UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';

export class UserEntity {
	id?: string;
	email: string;
	passwordHash: string;
	role: UserRole;

	constructor(email: string, passwordHash: string) {
		this.email = email;
		this.passwordHash = passwordHash;
	}

	static setFromModel(user: User): UserEntity {
		const userEntity = new UserEntity(user.email, user.passwordHash);
		userEntity.id = user.id;
		userEntity.email = user.email;
		userEntity.passwordHash = user.passwordHash;
		userEntity.role = user.role;
		return userEntity;
	}

	async setPassword(password: string): Promise<this> {
		const passwordHash = await hash(password, 10);
		this.passwordHash = passwordHash;
		return this;
	}

	comparePassword(password: string): Promise<boolean> {
		return compare(password, this.passwordHash);
	}
}

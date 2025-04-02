import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';

export class UserEntity {
	id?: string;
	email: string;
	passwordHash: string;

	constructor(email: string, passwordHash: string) {
		this.email = email;
		this.passwordHash = passwordHash;
	}

	setFromModel(user: User): this {
		this.id = user.id;
		this.email = user.email;
		this.passwordHash = user.passwordHash;
		return this;
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

import { Appeal, AppealStatus } from '@prisma/client';
import { IAppeal } from '../appeal.interfaces';
import { UserEntity } from 'src/user/entities/user.entity';

export class AppealEntity {
	id?: string;
	date?: Date;
	title: string;
	description: string;
	files: string[];
	status?: AppealStatus;
	solution?: string;
	dateSolution?: Date;
	admin?: UserEntity;
	user: UserEntity;

	constructor(appeal: IAppeal) {
		this.id = appeal.id;
		this.date = appeal.date && new Date(appeal.date);
		this.title = appeal.title;
		this.description = appeal.description;
		this.files = Array.isArray(appeal.files) ? appeal.files : [];
		this.status = appeal.status;
		this.solution = appeal.solution || undefined;
		this.dateSolution = appeal.dateSolution ? new Date(appeal.dateSolution) : undefined;
		this.user = appeal.user;
		this.admin = appeal.admin;
	}

	getPublicInfo<T extends Partial<Appeal>>(): T {
		const object = {
			id: this.id,
			date: this.date,
			title: this.title,
			description: this.description,
			files: this.files,
			status: this.status,
			solution: this.solution,
			dateSolution: this.dateSolution,
			adminId: this.admin?.id,
			userId: this.user.id
		};

		return object as T;
	}
}

import { Injectable, Logger } from '@nestjs/common';
import { Appeal, AppealStatus } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { AppealEntity } from '../entities/appeal.entity';

@Injectable()
export class AppealRepository {
	constructor(private database: DatabaseService) {}

	async create(entity: AppealEntity): Promise<Appeal> {
		try {
			return await this.database.appeal.create({
				data: entity.getPublicInfo<Appeal>()
			});
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}

	findUnprocessedAppealByTitle(title: string, userId: string): Promise<Appeal | null> {
		return this.database.appeal.findFirst({
			where: {
				title,
				userId,
				status: { in: [AppealStatus.NEW, AppealStatus.IN_PROGRESS] }
			}
		});
	}

	getLast(): Promise<Appeal | null> {
		return this.database.appeal.findFirst({
			where: {
				status: { in: [AppealStatus.NEW] }
			},
			orderBy: {
				date: 'desc'
			}
		});
	}

	getById(id: string): Promise<Appeal | null> {
		return this.database.appeal.findUnique({ where: { id } });
	}

	async update(appeal: AppealEntity): Promise<Appeal> {
		try {
			return await this.database.appeal.update({
				where: { id: appeal.id },
				data: appeal.getPublicInfo<Appeal>()
			});
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}
}

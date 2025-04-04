import { Injectable, Logger } from '@nestjs/common';
import { Appeal, AppealStatus } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { AppealEntity } from '../entities/appeal.entity';
import { AppealListFilters } from '../appeal.interfaces';

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

	findUnprocessedAppealByTitle(title: string): Promise<Appeal | null> {
		return this.database.appeal.findFirst({
			where: {
				title,
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

	getAppealList({ startDate: gte, endDate: lte }: AppealListFilters): Promise<Appeal[]> {
		return this.database.appeal.findMany({
			where: {
				date: {
					gte,
					lte
				}
			},
			orderBy: {
				date: 'desc'
			}
		});
	}

	getAllInProgress(): Promise<Appeal[]> {
		return this.database.appeal.findMany({
			where: {
				status: AppealStatus.IN_PROGRESS
			}
		});
	}
}

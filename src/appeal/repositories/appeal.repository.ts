import { Injectable, Logger } from '@nestjs/common';
import { Appeal, AppealStatus } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { AppealEntity } from '../entities/appeal.entity';

@Injectable()
export class AppealRepository {
	constructor(private database: DatabaseService) {}

	create(entity: AppealEntity): Promise<Appeal> {
		try {
			return this.database.appeal.create({
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
}

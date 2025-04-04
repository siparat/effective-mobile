import { ConflictException, Injectable } from '@nestjs/common';
import { Appeal, User } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealRepository } from './repositories/appeal.repository';
import { AppealErrorMessages } from './appeal.constants';
import { AppealEntity } from './entities/appeal.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class AppealService {
	constructor(private appealRepository: AppealRepository) {}

	async create(dto: CreateAppealDto, user: User): Promise<Appeal> {
		const appealWithThisName = await this.appealRepository.findUnprocessedAppealByTitle(dto.title, user.id);
		if (appealWithThisName) {
			throw new ConflictException(AppealErrorMessages.APPEAL_ALREADY_EXIST);
		}

		const userEntity = UserEntity.setFromModel(user);
		const appealEntity = new AppealEntity({ ...dto, user: userEntity });

		return this.appealRepository.create(appealEntity);
	}
}

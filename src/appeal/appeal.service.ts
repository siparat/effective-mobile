import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Appeal, AppealStatus, User } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealRepository } from './repositories/appeal.repository';
import { AppealErrorMessages } from './appeal.constants';
import { AppealEntity } from './entities/appeal.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UserErrorMessages } from 'src/user/user.constants';

@Injectable()
export class AppealService {
	constructor(
		private appealRepository: AppealRepository,
		private userRepository: UserRepository
	) {}

	async create(dto: CreateAppealDto, user: User): Promise<Appeal> {
		const appealWithThisName = await this.appealRepository.findUnprocessedAppealByTitle(dto.title, user.id);
		if (appealWithThisName) {
			throw new ConflictException(AppealErrorMessages.APPEAL_ALREADY_EXIST);
		}

		const userEntity = UserEntity.setFromModel(user);
		const appealEntity = new AppealEntity({ ...dto, user: userEntity });

		return this.appealRepository.create(appealEntity);
	}

	async takeAppeal(appealId: 'last' | string, admin: User): Promise<Appeal> {
		let appeal: Appeal | null = null;
		if (appealId === 'last') {
			appeal = await this.appealRepository.getLast();
		} else {
			appeal = await this.appealRepository.getById(appealId);
		}
		if (!appeal) {
			throw new NotFoundException(AppealErrorMessages.APPEAL_NOT_FOUND);
		}

		switch (appeal.status) {
			case AppealStatus.IN_PROGRESS:
				throw new ConflictException(AppealErrorMessages.APPEAL_ALREADY_IN_PROGRESS);
			case AppealStatus.SOLVED:
				throw new ConflictException(AppealErrorMessages.APPEAL_ALREADY_SOLVED);
		}

		const user = await this.userRepository.getUserById(appeal.userId);
		if (!user) {
			throw new NotFoundException(UserErrorMessages.NOT_FOUND);
		}

		const userEntity = UserEntity.setFromModel(user);
		const adminEntity = UserEntity.setFromModel(admin);
		const appealEntity = new AppealEntity({
			...appeal,
			user: userEntity,
			admin: adminEntity,
			status: AppealStatus.IN_PROGRESS
		});
		return this.appealRepository.takeAppeal(appealEntity);
	}
}

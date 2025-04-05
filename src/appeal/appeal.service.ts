import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Appeal, AppealStatus, User } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealRepository } from './repositories/appeal.repository';
import { AppealErrorMessages } from './appeal.constants';
import { AppealEntity } from './entities/appeal.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UserErrorMessages } from 'src/user/user.constants';
import { ResolveAppealDto } from './dto/resolve-appeal.dto';
import { CancelAppealDto } from './dto/cancel-appeal.dto';

@Injectable()
export class AppealService {
	constructor(
		private appealRepository: AppealRepository,
		private userRepository: UserRepository
	) {}

	async create(dto: CreateAppealDto, user: User, files: string[]): Promise<Appeal> {
		const appealWithThisName = await this.appealRepository.findUnprocessedAppealByTitle(dto.title, user.id);
		if (appealWithThisName) {
			throw new ConflictException(AppealErrorMessages.ALREADY_EXIST);
		}

		const userEntity = UserEntity.setFromModel(user);
		const appealEntity = new AppealEntity({ ...dto, files, user: userEntity });

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
			throw new NotFoundException(AppealErrorMessages.NOT_FOUND);
		}

		switch (appeal.status) {
			case AppealStatus.IN_PROGRESS:
				throw new ConflictException(AppealErrorMessages.ALREADY_IN_PROGRESS);
			case AppealStatus.SOLVED:
				throw new ConflictException(AppealErrorMessages.ALREADY_SOLVED);
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
			status: AppealStatus.IN_PROGRESS,
			dateSolution: null,
			solution: null,
			dateCancellation: null,
			reasonForCancellation: null
		});
		return this.appealRepository.update(appealEntity);
	}

	async resolveAppeal(appealId: string, dto: ResolveAppealDto, admin: User): Promise<Appeal> {
		const appeal = await this.appealRepository.getById(appealId);
		if (!appeal) {
			throw new NotFoundException(AppealErrorMessages.NOT_FOUND);
		}
		if (appeal.status !== AppealStatus.IN_PROGRESS) {
			throw new ForbiddenException(AppealErrorMessages.NOT_IN_PROGRESS);
		}
		if (appeal.adminId !== admin.id) {
			throw new ForbiddenException(AppealErrorMessages.NOT_OWNER);
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
			status: AppealStatus.SOLVED,
			solution: dto.solution,
			dateSolution: new Date()
		});
		return this.appealRepository.update(appealEntity);
	}

	async cancelAppeal(appealId: string, dto: CancelAppealDto, admin: User): Promise<Appeal> {
		const appeal = await this.appealRepository.getById(appealId);
		if (!appeal) {
			throw new NotFoundException(AppealErrorMessages.NOT_FOUND);
		}
		if (appeal.status !== AppealStatus.IN_PROGRESS) {
			throw new ForbiddenException(AppealErrorMessages.NOT_IN_PROGRESS);
		}
		if (appeal.adminId !== admin.id) {
			throw new ForbiddenException(AppealErrorMessages.NOT_OWNER);
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
			status: AppealStatus.CANCELED,
			reasonForCancellation: dto.reason || null,
			dateCancellation: new Date()
		});
		return this.appealRepository.update(appealEntity);
	}

	async cancelAllInProgressAppeals(dto: CancelAppealDto, admin: User): Promise<Appeal[]> {
		const appeals = await this.appealRepository.getAllInProgress();
		const results: Appeal[] = [];

		for (const appeal of appeals) {
			if (appeal.adminId !== admin.id) {
				continue;
			}

			const user = await this.userRepository.getUserById(appeal.userId);
			if (!user) {
				continue;
			}

			const userEntity = UserEntity.setFromModel(user);
			const adminEntity = UserEntity.setFromModel(admin);
			const appealEntity = new AppealEntity({
				...appeal,
				user: userEntity,
				admin: adminEntity,
				status: AppealStatus.CANCELED,
				reasonForCancellation: dto.reason || null,
				dateCancellation: new Date()
			});
			const updatedAppeal = await this.appealRepository.update(appealEntity);
			results.push(updatedAppeal);
		}

		return results;
	}
}

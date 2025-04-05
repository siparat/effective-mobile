import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Appeal, AppealStatus } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealRepository } from './repositories/appeal.repository';
import { AppealErrorMessages } from './appeal.constants';
import { AppealEntity } from './entities/appeal.entity';
import { ResolveAppealDto } from './dto/resolve-appeal.dto';
import { CancelAppealDto } from './dto/cancel-appeal.dto';

@Injectable()
export class AppealService {
	constructor(private appealRepository: AppealRepository) {}

	async create(dto: CreateAppealDto, files: string[]): Promise<Appeal> {
		const appealWithThisName = await this.appealRepository.findUnprocessedAppealByTitle(dto.title);
		if (appealWithThisName) {
			throw new ConflictException(AppealErrorMessages.ALREADY_EXIST);
		}

		const appealEntity = new AppealEntity({ ...dto, files });

		return this.appealRepository.create(appealEntity);
	}

	async takeAppeal(appealId: 'last' | string): Promise<Appeal> {
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

		const appealEntity = new AppealEntity({
			...appeal,
			status: AppealStatus.IN_PROGRESS,
			dateSolution: null,
			solution: null,
			dateCancellation: null,
			reasonForCancellation: null
		});
		return this.appealRepository.update(appealEntity);
	}

	async resolveAppeal(appealId: string, dto: ResolveAppealDto): Promise<Appeal> {
		const appeal = await this.appealRepository.getById(appealId);
		if (!appeal) {
			throw new NotFoundException(AppealErrorMessages.NOT_FOUND);
		}
		if (appeal.status !== AppealStatus.IN_PROGRESS) {
			throw new ForbiddenException(AppealErrorMessages.NOT_IN_PROGRESS);
		}

		const appealEntity = new AppealEntity({
			...appeal,
			status: AppealStatus.SOLVED,
			solution: dto.solution,
			dateSolution: new Date()
		});
		return this.appealRepository.update(appealEntity);
	}

	async cancelAppeal(appealId: string, dto: CancelAppealDto): Promise<Appeal> {
		const appeal = await this.appealRepository.getById(appealId);
		if (!appeal) {
			throw new NotFoundException(AppealErrorMessages.NOT_FOUND);
		}
		if (appeal.status !== AppealStatus.IN_PROGRESS) {
			throw new ForbiddenException(AppealErrorMessages.NOT_IN_PROGRESS);
		}
		const appealEntity = new AppealEntity({
			...appeal,
			status: AppealStatus.CANCELED,
			reasonForCancellation: dto.reason || null,
			dateCancellation: new Date()
		});
		return this.appealRepository.update(appealEntity);
	}

	async cancelAllInProgressAppeals(dto: CancelAppealDto): Promise<Appeal[]> {
		const appeals = await this.appealRepository.getAllInProgress();
		const results: Appeal[] = [];

		for (const appeal of appeals) {
			const appealEntity = new AppealEntity({
				...appeal,
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

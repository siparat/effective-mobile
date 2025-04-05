import {
	Body,
	Controller,
	Get,
	Param,
	ParseDatePipe,
	ParseUUIDPipe,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
	UsePipes
} from '@nestjs/common';
import { Appeal } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { AppealService } from './appeal.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { UUID } from 'crypto';
import { AppealRepository } from './repositories/appeal.repository';
import { ResolveAppealDto } from './dto/resolve-appeal.dto';
import { CancelAppealDto } from './dto/cancel-appeal.dto';
import { AppealListFilters } from './appeal.interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';

@Controller('appeal')
export class AppealController {
	constructor(
		private appealService: AppealService,
		private appealRepository: AppealRepository,
		private fileService: FileService
	) {}

	@UseInterceptors(FilesInterceptor('files', 5, { limits: { fileSize: 10_485_760 } }))
	@UsePipes(ZodValidationPipe)
	@Post()
	async create(@Body() dto: CreateAppealDto, @UploadedFiles() files?: Express.Multer.File[]): Promise<Appeal> {
		const filePaths: string[] = [];

		for (const file of files || []) {
			const response = await this.fileService.saveFile(file);
			filePaths.push(response.path);
		}

		try {
			return await this.appealService.create(dto, filePaths);
		} catch (error) {
			for (const path of filePaths) {
				const fileName = path.split('/').pop();
				if (!fileName) {
					continue;
				}
				await this.fileService.removeFile(fileName);
			}
			throw error;
		}
	}

	@Post('last/take')
	async takeLastAppeal(): Promise<Appeal> {
		return this.appealService.takeAppeal('last');
	}

	@Get('list')
	async getAppealList(
		@Query('date', new ParseDatePipe({ optional: true })) date?: Date,
		@Query('start_date', new ParseDatePipe({ optional: true })) startDate?: Date,
		@Query('end_date', new ParseDatePipe({ optional: true })) endDate?: Date
	): Promise<Appeal[]> {
		const filter: AppealListFilters = {
			startDate,
			endDate
		};

		if (date) {
			filter.startDate = new Date(date.setHours(0, 0, 0, 0));
			filter.endDate = new Date(date.setHours(23, 59, 59, 999));
		}

		return this.appealRepository.getAppealList(filter);
	}

	@Post(':id/take')
	async takeAppealById(@Param('id', ParseUUIDPipe) id: UUID): Promise<Appeal> {
		return this.appealService.takeAppeal(id);
	}

	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: UUID): Promise<Appeal | null> {
		return this.appealRepository.getById(id);
	}

	@UsePipes(ZodValidationPipe)
	@Post(':id/resolve')
	async resolveAppeal(@Param('id', ParseUUIDPipe) id: UUID, @Body() dto: ResolveAppealDto): Promise<Appeal> {
		return this.appealService.resolveAppeal(id, dto);
	}

	@UsePipes(ZodValidationPipe)
	@Post(':id/cancel')
	async cancelAppeal(@Param('id', ParseUUIDPipe) id: UUID, @Body() dto: CancelAppealDto): Promise<Appeal> {
		return this.appealService.cancelAppeal(id, dto);
	}

	@UsePipes(ZodValidationPipe)
	@Post('cancel-all')
	async cancelAllInProgress(@Body() dto: CancelAppealDto): Promise<Appeal[]> {
		return this.appealService.cancelAllInProgressAppeals(dto);
	}
}

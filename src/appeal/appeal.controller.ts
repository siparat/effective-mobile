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
	UseGuards,
	UseInterceptors,
	UsePipes
} from '@nestjs/common';
import { Appeal, User, UserRole } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { UserData } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppealService } from './appeal.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { AvialableRoles, RoleGuard } from 'src/user/gurads/role.guard';
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
	@UseGuards(JwtAuthGuard)
	@Post()
	async create(
		@Body() dto: CreateAppealDto,
		@UserData() user: User,
		@UploadedFiles() files?: Express.Multer.File[]
	): Promise<Appeal> {
		const filePaths: string[] = [];

		for (const file of files || []) {
			const response = await this.fileService.saveFile(file);
			filePaths.push(response.path);
		}

		try {
			return await this.appealService.create(dto, user, filePaths);
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

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post('last/take')
	async takeLastAppeal(@UserData() user: User): Promise<Appeal> {
		return this.appealService.takeAppeal('last', user);
	}

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
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

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post(':id/take')
	async takeAppealById(@Param('id', ParseUUIDPipe) id: UUID, @UserData() admin: User): Promise<Appeal> {
		return this.appealService.takeAppeal(id, admin);
	}

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: UUID): Promise<Appeal | null> {
		return this.appealRepository.getById(id);
	}

	@UsePipes(ZodValidationPipe)
	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post(':id/resolve')
	async resolveAppeal(
		@Param('id', ParseUUIDPipe) id: UUID,
		@Body() dto: ResolveAppealDto,
		@UserData() admin: User
	): Promise<Appeal> {
		return this.appealService.resolveAppeal(id, dto, admin);
	}

	@UsePipes(ZodValidationPipe)
	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post(':id/cancel')
	async cancelAppeal(
		@Param('id', ParseUUIDPipe) id: UUID,
		@Body() dto: CancelAppealDto,
		@UserData() admin: User
	): Promise<Appeal> {
		return this.appealService.cancelAppeal(id, dto, admin);
	}

	@UsePipes(ZodValidationPipe)
	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post('cancel-all')
	async cancelAllInProgress(@Body() dto: CancelAppealDto, @UserData() admin: User): Promise<Appeal[]> {
		return this.appealService.cancelAllInProgressAppeals(dto, admin);
	}
}

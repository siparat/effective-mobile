import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, UsePipes } from '@nestjs/common';
import { Appeal, User, UserRole } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { UserData } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppealService } from './appeal.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { AvialableRoles, RoleGuard } from 'src/user/gurads/role.guard';
import { UUID } from 'crypto';
import { AppealRepository } from './repositories/appeal.repository';

@Controller('appeal')
export class AppealController {
	constructor(
		private appealService: AppealService,
		private appealRepository: AppealRepository
	) {}

	@UsePipes(ZodValidationPipe)
	@UseGuards(JwtAuthGuard)
	@Post()
	async create(@Body() dto: CreateAppealDto, @UserData() user: User): Promise<Appeal> {
		// TODO: save files;
		return this.appealService.create(dto, user);
	}

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post('take/last')
	async takeLastAppeal(@UserData() user: User): Promise<Appeal> {
		return this.appealService.takeAppeal('last', user);
	}

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Post('take/:id')
	async takeAppealById(@Param('id', ParseUUIDPipe) id: UUID, @UserData() user: User): Promise<Appeal> {
		return this.appealService.takeAppeal(id, user);
	}

	@AvialableRoles([UserRole.ADMIN])
	@UseGuards(JwtAuthGuard, RoleGuard)
	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: UUID): Promise<Appeal | null> {
		return this.appealRepository.getById(id);
	}
}

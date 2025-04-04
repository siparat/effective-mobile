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
import { ResolveAppealDto } from './dto/resolve-appeal.dto';
import { CancelAppealDto } from './dto/cancel-appeal.dto';

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
	@Post('last/take')
	async takeLastAppeal(@UserData() user: User): Promise<Appeal> {
		return this.appealService.takeAppeal('last', user);
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
}

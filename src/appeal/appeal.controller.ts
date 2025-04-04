import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { Appeal, User } from '@prisma/client';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { UserData } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppealService } from './appeal.service';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('appeal')
export class AppealController {
	constructor(private appealService: AppealService) {}

	@UsePipes(ZodValidationPipe)
	@UseGuards(JwtAuthGuard)
	@Post()
	async create(@Body() dto: CreateAppealDto, @UserData() user: User): Promise<Appeal> {
		// TODO: save files;
		return this.appealService.create(dto, user);
	}
}

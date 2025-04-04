import { Module } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { AppealController } from './appeal.controller';
import { AppealRepository } from './repositories/appeal.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
	imports: [DatabaseModule],
	providers: [AppealService, AppealRepository],
	controllers: [AppealController]
})
export class AppealModule {}

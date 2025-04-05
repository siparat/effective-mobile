import { Module } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { AppealController } from './appeal.controller';
import { AppealRepository } from './repositories/appeal.repository';
import { DatabaseModule } from 'src/database/database.module';
import { FileModule } from 'src/file/file.module';

@Module({
	imports: [DatabaseModule, FileModule],
	providers: [AppealService, AppealRepository],
	controllers: [AppealController]
})
export class AppealModule {}

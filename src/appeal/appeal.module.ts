import { Module } from '@nestjs/common';
import { AppealService } from './appeal.service';
import { AppealController } from './appeal.controller';
import { AppealRepository } from './repositories/appeal.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [DatabaseModule, UserModule],
	providers: [AppealService, AppealRepository],
	controllers: [AppealController]
})
export class AppealModule {}

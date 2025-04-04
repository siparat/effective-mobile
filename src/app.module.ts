import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AppealModule } from './appeal/appeal.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, DatabaseModule, AppealModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}

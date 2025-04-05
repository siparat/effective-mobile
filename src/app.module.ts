import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AppealModule } from './appeal/appeal.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'uploads'),
			serveRoot: '/uploads'
		}),
		AuthModule,
		DatabaseModule,
		AppealModule,
		FileModule
	]
})
export class AppModule {}

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import { SavedFileResponse } from './file.interfaces';
import { join } from 'path';
import { path } from 'app-root-path';
import { ensureDirSync, rm, writeFile } from 'fs-extra';
import { ConfigService } from '@nestjs/config';
import { FileErrorMessages, UPLOADS_DIR_NAME } from './file.constants';
import { randomUUID } from 'crypto';

@Injectable()
export class FileService {
	private uploadDir: string;
	private domain: string;

	constructor(private config: ConfigService) {
		this.uploadDir = join(path, UPLOADS_DIR_NAME);
		this.domain = this.config.getOrThrow('DOMAIN');
		ensureDirSync(this.uploadDir);
	}

	async saveFile(file: Express.Multer.File): Promise<SavedFileResponse> {
		try {
			if (file.mimetype.includes('image')) {
				file.buffer = await this.convertToWebp(file.buffer);
				file.originalname = `${file.originalname.split('.')[0]}.webp`;
				file.mimetype = 'image/webp';
			}

			const ext = file.originalname.split('.').pop();
			const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
			const filePath = join(this.uploadDir, fileName);
			await writeFile(filePath, file.buffer);

			return {
				fileName,
				originalName: file.originalname,
				mimeType: file.mimetype,
				url: `${this.domain}/${UPLOADS_DIR_NAME}/${fileName}`,
				path: `/${UPLOADS_DIR_NAME}/${fileName}`,
				size: file.size
			};
		} catch (error) {
			Logger.error(`Ошибка при сохранении файла:`, file, error);
			throw new InternalServerErrorException(FileErrorMessages.SAVING_FAILED);
		}
	}

	async removeFile(fileName: string): Promise<void> {
		const filePath = join(this.uploadDir, fileName);
		await rm(filePath, { force: true });
	}

	private convertToWebp(buffer: Buffer): Promise<Buffer> {
		return sharp(buffer).webp({ quality: 70 }).toBuffer();
	}
}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateAppealSchema = z.object({
	title: z.string().min(4).max(64),
	description: z.string().min(200).max(4096)
});

export class CreateAppealDto extends createZodDto(CreateAppealSchema) {}

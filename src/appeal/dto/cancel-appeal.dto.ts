import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CancelAppealSchema = z.object({
	reason: z.string().max(1024)
});

export class CancelAppealDto extends createZodDto(CancelAppealSchema) {}

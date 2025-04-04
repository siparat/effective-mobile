import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResolveAppealSchema = z.object({
	solution: z.string().max(4096)
});

export class ResolveAppealDto extends createZodDto(ResolveAppealSchema) {}

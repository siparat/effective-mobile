import { z } from 'zod';

export const AuthBaseSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

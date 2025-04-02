import { createZodDto } from 'nestjs-zod';
import { AuthBaseSchema } from './auth.schema';

const LoginDtoSchema = AuthBaseSchema;

export class LoginDto extends createZodDto(LoginDtoSchema) {}

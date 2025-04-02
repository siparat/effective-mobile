import { createZodDto } from 'nestjs-zod';
import { AuthBaseSchema } from './auth.schema';

const RegisterDtoSchema = AuthBaseSchema;

export class RegisterDto extends createZodDto(RegisterDtoSchema) {}

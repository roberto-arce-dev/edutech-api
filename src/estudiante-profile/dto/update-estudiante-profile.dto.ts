import { PartialType } from '@nestjs/swagger';
import { CreateEstudianteProfileDto } from './create-estudiante-profile.dto';

export class UpdateEstudianteProfileDto extends PartialType(CreateEstudianteProfileDto) {}

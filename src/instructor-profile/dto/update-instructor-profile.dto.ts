import { PartialType } from '@nestjs/swagger';
import { CreateInstructorProfileDto } from './create-instructor-profile.dto';

export class UpdateInstructorProfileDto extends PartialType(CreateInstructorProfileDto) {}

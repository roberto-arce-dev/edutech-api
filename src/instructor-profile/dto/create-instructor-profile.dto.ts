import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstructorProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombreCompleto: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  especialidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  certificaciones?: string[];

}

import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../enums/roles.enum';

/**
 * DTO para registro de usuarios
 * Crea User + Profile correspondiente según el rol
 */
export class RegisterDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: Role.ESTUDIANTE,
    description: 'Rol del usuario',
    enum: [Role.ESTUDIANTE, Role.INSTRUCTOR],
  })
  @IsNotEmpty()
  @IsEnum([Role.ESTUDIANTE, Role.INSTRUCTOR])
  role: Role;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    example: '+51 987654321',
    description: 'Teléfono de contacto',
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    example: 'Valor de ejemplo',
    description: 'nivel (opcional)',
  })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiPropertyOptional({
    example: 'Valor de ejemplo',
    description: 'preferencias (opcional)',
  })
  @IsOptional()
  @IsArray()
  preferencias?: string[];

  @ApiPropertyOptional({
    example: 'Valor de ejemplo',
    description: 'especialidad (para rol INSTRUCTOR)',
  })
  @ValidateIf((o) => o.role === Role.INSTRUCTOR)
  @IsNotEmpty({ message: 'especialidad es requerido para INSTRUCTOR' })
  @IsString()
  especialidad?: string;

  @ApiPropertyOptional({
    example: 'Valor de ejemplo',
    description: 'biografia (opcional)',
  })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiPropertyOptional({
    example: 'Valor de ejemplo',
    description: 'certificaciones (opcional)',
  })
  @IsOptional()
  @IsArray()
  certificaciones?: string[];

}

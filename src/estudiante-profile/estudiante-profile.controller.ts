import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EstudianteProfileService } from './estudiante-profile.service';
import { CreateEstudianteProfileDto } from './dto/create-estudiante-profile.dto';
import { UpdateEstudianteProfileDto } from './dto/update-estudiante-profile.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';

@ApiTags('estudiante-profile')
@ApiBearerAuth()
@Controller('estudiante-profile')
export class EstudianteProfileController {
  constructor(private readonly estudianteprofileService: EstudianteProfileService) {}

  @Get('me')
  @Roles(Role.ESTUDIANTE)
  @ApiOperation({ summary: 'Obtener mi perfil' })
  async getMyProfile(@Request() req) {
    return this.estudianteprofileService.findByUserId(req.user.id);
  }

  @Put('me')
  @Roles(Role.ESTUDIANTE)
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  async updateMyProfile(@Request() req, @Body() dto: UpdateEstudianteProfileDto) {
    return this.estudianteprofileService.update(req.user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos los perfiles (Admin)' })
  async findAll() {
    return this.estudianteprofileService.findAll();
  }

  @Get(':userId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener perfil por userId (Admin)' })
  async findByUserId(@Param('userId') userId: string) {
    return this.estudianteprofileService.findByUserId(userId);
  }
}

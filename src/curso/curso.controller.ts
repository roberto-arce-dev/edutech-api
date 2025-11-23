import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Curso')
@ApiBearerAuth('JWT-auth')
@Controller('curso')
export class CursoController {
  constructor(
    private readonly cursoService: CursoService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Curso' })
  @ApiBody({ type: CreateCursoDto })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createCursoDto: CreateCursoDto) {
    const data = await this.cursoService.create(createCursoDto);
    return {
      success: true,
      message: 'Curso creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Curso' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Curso' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen subida exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async uploadImage(
    @Param('id') id: string,
    @Req() request: FastifyRequest,
  ) {
    // Obtener archivo de Fastify
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!data.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    const buffer = await data.toBuffer();
    const file = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
    } as Express.Multer.File;

    const uploadResult = await this.uploadService.uploadImage(file);
    const updated = await this.cursoService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { curso: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Cursos' })
  @ApiResponse({ status: 200, description: 'Lista de Cursos' })
  async findAll() {
    const data = await this.cursoService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Curso por ID' })
  @ApiParam({ name: 'id', description: 'ID del Curso' })
  @ApiResponse({ status: 200, description: 'Curso encontrado' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.cursoService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Curso' })
  @ApiParam({ name: 'id', description: 'ID del Curso' })
  @ApiBody({ type: UpdateCursoDto })
  @ApiResponse({ status: 200, description: 'Curso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateCursoDto: UpdateCursoDto
  ) {
    const data = await this.cursoService.update(id, updateCursoDto);
    return {
      success: true,
      message: 'Curso actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Curso' })
  @ApiParam({ name: 'id', description: 'ID del Curso' })
  @ApiResponse({ status: 200, description: 'Curso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async remove(@Param('id') id: string) {
    const curso = await this.cursoService.findOne(id);
    if (curso.imagen) {
      const filename = curso.imagen.split('/').pop();
      if (filename) {
        await this.uploadService.deleteImage(filename);
      }
    }
    await this.cursoService.remove(id);
    return { success: true, message: 'Curso eliminado exitosamente' };
  }
}

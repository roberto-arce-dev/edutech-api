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
import { InscripcionService } from './inscripcion.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Inscripcion')
@ApiBearerAuth('JWT-auth')
@Controller('inscripcion')
export class InscripcionController {
  constructor(
    private readonly inscripcionService: InscripcionService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Inscripcion' })
  @ApiBody({ type: CreateInscripcionDto })
  @ApiResponse({ status: 201, description: 'Inscripcion creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createInscripcionDto: CreateInscripcionDto) {
    const data = await this.inscripcionService.create(createInscripcionDto);
    return {
      success: true,
      message: 'Inscripcion creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Inscripcion' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Inscripcion' })
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
  @ApiResponse({ status: 404, description: 'Inscripcion no encontrado' })
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
    const updated = await this.inscripcionService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { inscripcion: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Inscripcions' })
  @ApiResponse({ status: 200, description: 'Lista de Inscripcions' })
  async findAll() {
    const data = await this.inscripcionService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Inscripcion por ID' })
  @ApiParam({ name: 'id', description: 'ID del Inscripcion' })
  @ApiResponse({ status: 200, description: 'Inscripcion encontrado' })
  @ApiResponse({ status: 404, description: 'Inscripcion no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.inscripcionService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Inscripcion' })
  @ApiParam({ name: 'id', description: 'ID del Inscripcion' })
  @ApiBody({ type: UpdateInscripcionDto })
  @ApiResponse({ status: 200, description: 'Inscripcion actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Inscripcion no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateInscripcionDto: UpdateInscripcionDto
  ) {
    const data = await this.inscripcionService.update(id, updateInscripcionDto);
    return {
      success: true,
      message: 'Inscripcion actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Inscripcion' })
  @ApiParam({ name: 'id', description: 'ID del Inscripcion' })
  @ApiResponse({ status: 200, description: 'Inscripcion eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Inscripcion no encontrado' })
  async remove(@Param('id') id: string) {
    const inscripcion = await this.inscripcionService.findOne(id);
    if (inscripcion.imagen) {
      const filename = inscripcion.imagen.split('/').pop();
      if (filename) {
        await this.uploadService.deleteImage(filename);
      }
    }
    await this.inscripcionService.remove(id);
    return { success: true, message: 'Inscripcion eliminado exitosamente' };
  }
}

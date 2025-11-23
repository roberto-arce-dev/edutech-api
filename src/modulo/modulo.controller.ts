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
import { ModuloService } from './modulo.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Modulo')
@ApiBearerAuth('JWT-auth')
@Controller('modulo')
export class ModuloController {
  constructor(
    private readonly moduloService: ModuloService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Modulo' })
  @ApiBody({ type: CreateModuloDto })
  @ApiResponse({ status: 201, description: 'Modulo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createModuloDto: CreateModuloDto) {
    const data = await this.moduloService.create(createModuloDto);
    return {
      success: true,
      message: 'Modulo creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Modulo' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Modulo' })
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
  @ApiResponse({ status: 404, description: 'Modulo no encontrado' })
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
    const updated = await this.moduloService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { modulo: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Modulos' })
  @ApiResponse({ status: 200, description: 'Lista de Modulos' })
  async findAll() {
    const data = await this.moduloService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Modulo por ID' })
  @ApiParam({ name: 'id', description: 'ID del Modulo' })
  @ApiResponse({ status: 200, description: 'Modulo encontrado' })
  @ApiResponse({ status: 404, description: 'Modulo no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.moduloService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Modulo' })
  @ApiParam({ name: 'id', description: 'ID del Modulo' })
  @ApiBody({ type: UpdateModuloDto })
  @ApiResponse({ status: 200, description: 'Modulo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Modulo no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateModuloDto: UpdateModuloDto
  ) {
    const data = await this.moduloService.update(id, updateModuloDto);
    return {
      success: true,
      message: 'Modulo actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Modulo' })
  @ApiParam({ name: 'id', description: 'ID del Modulo' })
  @ApiResponse({ status: 200, description: 'Modulo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Modulo no encontrado' })
  async remove(@Param('id') id: string) {
    const modulo = await this.moduloService.findOne(id);
    if (modulo.imagen) {
      const filename = modulo.imagen.split('/').pop();
      if (filename) {
        await this.uploadService.deleteImage(filename);
      }
    }
    await this.moduloService.remove(id);
    return { success: true, message: 'Modulo eliminado exitosamente' };
  }
}

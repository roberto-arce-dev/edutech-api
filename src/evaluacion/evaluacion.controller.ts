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
import { EvaluacionService } from './evaluacion.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Evaluacion')
@ApiBearerAuth('JWT-auth')
@Controller('evaluacion')
export class EvaluacionController {
  constructor(
    private readonly evaluacionService: EvaluacionService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Evaluacion' })
  @ApiBody({ type: CreateEvaluacionDto })
  @ApiResponse({ status: 201, description: 'Evaluacion creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    const data = await this.evaluacionService.create(createEvaluacionDto);
    return {
      success: true,
      message: 'Evaluacion creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Evaluacion' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Evaluacion' })
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
  @ApiResponse({ status: 404, description: 'Evaluacion no encontrado' })
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
    const updated = await this.evaluacionService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { evaluacion: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Evaluacions' })
  @ApiResponse({ status: 200, description: 'Lista de Evaluacions' })
  async findAll() {
    const data = await this.evaluacionService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Evaluacion por ID' })
  @ApiParam({ name: 'id', description: 'ID del Evaluacion' })
  @ApiResponse({ status: 200, description: 'Evaluacion encontrado' })
  @ApiResponse({ status: 404, description: 'Evaluacion no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.evaluacionService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Evaluacion' })
  @ApiParam({ name: 'id', description: 'ID del Evaluacion' })
  @ApiBody({ type: UpdateEvaluacionDto })
  @ApiResponse({ status: 200, description: 'Evaluacion actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evaluacion no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateEvaluacionDto: UpdateEvaluacionDto
  ) {
    const data = await this.evaluacionService.update(id, updateEvaluacionDto);
    return {
      success: true,
      message: 'Evaluacion actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Evaluacion' })
  @ApiParam({ name: 'id', description: 'ID del Evaluacion' })
  @ApiResponse({ status: 200, description: 'Evaluacion eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evaluacion no encontrado' })
  async remove(@Param('id') id: string) {
    const evaluacion = await this.evaluacionService.findOne(id);
    if (evaluacion.imagen) {
      const filename = evaluacion.imagen.split('/').pop();
      if (filename) {
        await this.uploadService.deleteImage(filename);
      }
    }
    await this.evaluacionService.remove(id);
    return { success: true, message: 'Evaluacion eliminado exitosamente' };
  }
}

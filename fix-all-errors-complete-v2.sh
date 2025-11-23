#!/bin/bash
# fix-all-errors-complete-v2.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Corrigiendo TODOS los errores (versión 2)${NC}\n"

get_roles() {
    case "$1" in
        "edutech-api") echo "USUARIO,INSTRUCTOR,ESTUDIANTE" ;;
        "ecomarket-api") echo "USUARIO,VENDEDOR,COMPRADOR" ;;
        "perfulandia-api") echo "USUARIO,CLIENTE" ;;
        "fitlife-api") echo "USUARIO,ENTRENADOR,CLIENTE" ;;
        "travelgo-api") echo "USUARIO,AGENTE,CLIENTE" ;;
        "artelab-api") echo "USUARIO,ARTISTA,CLIENTE" ;;
        "greensolar-api") echo "USUARIO,INSTALADOR,CLIENTE" ;;
        "booksy-api") echo "USUARIO,AUTOR,LECTOR" ;;
        "saborlocal-api") echo "USUARIO,PRODUCTOR,CLIENTE" ;;
        "cineplus-api") echo "USUARIO,SUSCRIPTOR" ;;
        "agroverde-api") echo "USUARIO,PRODUCTOR,CLIENTE" ;;
        "modaurbana-api") echo "USUARIO,VENDEDOR,CLIENTE" ;;
        "petsonline-api") echo "USUARIO,VETERINARIO,CLIENTE" ;;
        "reparafacil-api") echo "USUARIO,TECNICO,CLIENTE" ;;
        "aulaplus-api") echo "USUARIO,PROFESOR,ESTUDIANTE,APODERADO" ;;
        "saludconecta-api") echo "USUARIO,MEDICO,PACIENTE" ;;
        "reciclaapp-api") echo "USUARIO,RECOLECTOR" ;;
        "agrotech-api") echo "USUARIO,AGRICULTOR,TECNICO" ;;
        "educultura-api") echo "USUARIO,INSTRUCTOR,ESTUDIANTE" ;;
        "mobilitygreen-api") echo "USUARIO,CONDUCTOR,PASAJERO" ;;
        *) echo "USUARIO" ;;
    esac
}

get_entidades() {
    case "$1" in
        "edutech-api") echo "Usuario,Curso,Modulo,Inscripcion,Evaluacion" ;;
        "ecomarket-api") echo "Producto,Categoria,Cliente,Pedido,Pago" ;;
        "perfulandia-api") echo "Perfume,Categoria,Cliente,Pedido,Resena" ;;
        "fitlife-api") echo "Usuario,Entrenador,PlanEntrenamiento,PlanNutricional,Progreso" ;;
        "travelgo-api") echo "PaqueteTuristico,Cliente,Reserva,Pago,Itinerario" ;;
        "artelab-api") echo "Producto,Categoria,Cliente,Pedido,Promocion" ;;
        "greensolar-api") echo "ProyectoSolar,Cliente,Cotizacion,Instalador,MonitoreoConsumo" ;;
        "booksy-api") echo "Libro,Autor,Categoria,Cliente,Descarga" ;;
        "saborlocal-api") echo "Productor,Producto,Pedido,Cliente,Entrega" ;;
        "cineplus-api") echo "Pelicula,Usuario,Licencia,Entrada,Suscripcion" ;;
        "agroverde-api") echo "ProductoAgricola,Productor,Pedido,Cliente,RutaEntrega" ;;
        "modaurbana-api") echo "Producto,Categoria,Cliente,Pedido,Carrito" ;;
        "petsonline-api") echo "Mascota,Cliente,Producto,ServicioVeterinario,Reserva" ;;
        "reparafacil-api") echo "Cliente,Tecnico,Reparacion,Agenda,Garantia" ;;
        "aulaplus-api") echo "Colegio,Profesor,Estudiante,Curso,Evaluacion" ;;
        "saludconecta-api") echo "Paciente,Medico,CitaMedica,HistorialClinico,Tratamiento" ;;
        "reciclaapp-api") echo "Usuario,MaterialReciclado,PuntoRecoleccion,Transaccion,Recompensa" ;;
        "agrotech-api") echo "Parcela,SensorIoT,Cultivo,Medicion,Alerta" ;;
        "educultura-api") echo "CursoCultural,Instructor,Estudiante,Inscripcion,MaterialMultimedia" ;;
        "mobilitygreen-api") echo "Usuario,Vehiculo,Viaje,Ruta,Pago" ;;
        *) echo "" ;;
    esac
}

# ===================================
# 1. GENERAR ROLES ENUM
# ===================================
generar_roles_enum() {
    local proyecto=$1
    local roles=$2
    
    mkdir -p "$proyecto/src/auth/enums"
    
    cat > "$proyecto/src/auth/enums/roles.enum.ts" << EOF
export enum Role {
  ADMIN = 'ADMIN',
$(echo "$roles" | sed 's/,/\n/g' | awk '{print "  " toupper($1) " = '\''" toupper($1) "'\''," }')
}
EOF
    
    echo "    ✅ roles.enum.ts creado"
}

# ===================================
# 2. CORREGIR JWT MODULE
# ===================================
corregir_auth_module() {
    local proyecto=$1
    
    cat > "$proyecto/src/auth/auth.module.ts" << 'AUTHMODEOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { User, UserSchema } from './schemas/user.schema';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
AUTHMODEOF
    
    echo "    ✅ auth.module.ts corregido"
}

# ===================================
# 3. GENERAR MÓDULOS FALTANTES
# ===================================
generar_modulo_entidad_completo() {
    local proyecto=$1
    local entidad=$2
    local entidad_lower=$(echo "$entidad" | tr '[:upper:]' '[:lower:]')
    local entidad_kebab=$(echo "$entidad" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')
    
    mkdir -p "$proyecto/src/$entidad_lower/dto"
    mkdir -p "$proyecto/src/$entidad_lower/schemas"
    
    # Schema
    cat > "$proyecto/src/$entidad_lower/schemas/$entidad_lower.schema.ts" << SCHEMAEOF
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ${entidad}Document = ${entidad} & Document;

@Schema({ timestamps: true })
export class ${entidad} {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;
}

export const ${entidad}Schema = SchemaFactory.createForClass(${entidad});

${entidad}Schema.index({ nombre: 1 });
${entidad}Schema.index({ createdAt: -1 });
SCHEMAEOF

    # DTOs
    cat > "$proyecto/src/$entidad_lower/dto/create-$entidad_lower.dto.ts" << CREATEDTOEOF
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create${entidad}Dto {
  @ApiProperty({ example: 'Nombre del $entidad' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Descripción' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagenThumbnail?: string;
}
CREATEDTOEOF

    cat > "$proyecto/src/$entidad_lower/dto/update-$entidad_lower.dto.ts" << UPDATEDTOEOF
import { PartialType } from '@nestjs/swagger';
import { Create${entidad}Dto } from './create-$entidad_lower.dto';

export class Update${entidad}Dto extends PartialType(Create${entidad}Dto) {}
UPDATEDTOEOF

    # Service
    cat > "$proyecto/src/$entidad_lower/$entidad_lower.service.ts" << SERVICEEOF
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Create${entidad}Dto } from './dto/create-$entidad_lower.dto';
import { Update${entidad}Dto } from './dto/update-$entidad_lower.dto';
import { ${entidad}, ${entidad}Document } from './schemas/$entidad_lower.schema';

@Injectable()
export class ${entidad}Service {
  constructor(
    @InjectModel(${entidad}.name)
    private ${entidad_lower}Model: Model<${entidad}Document>,
  ) {}

  async create(create${entidad}Dto: Create${entidad}Dto): Promise<${entidad}> {
    const created = new this.${entidad_lower}Model(create${entidad}Dto);
    return created.save();
  }

  async findAll(): Promise<${entidad}[]> {
    return this.${entidad_lower}Model.find().exec();
  }

  async findOne(id: string): Promise<${entidad}> {
    const entity = await this.${entidad_lower}Model.findById(id).exec();
    if (!entity) {
      throw new NotFoundException('${entidad} con ID ' + id + ' no encontrado');
    }
    return entity;
  }

  async update(id: string, update${entidad}Dto: Update${entidad}Dto): Promise<${entidad}> {
    const updated = await this.${entidad_lower}Model
      .findByIdAndUpdate(id, update${entidad}Dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('${entidad} con ID ' + id + ' no encontrado');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.${entidad_lower}Model.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('${entidad} con ID ' + id + ' no encontrado');
    }
  }
}
SERVICEEOF

    # Controller
    cat > "$proyecto/src/$entidad_lower/$entidad_lower.controller.ts" << CONTROLLEREOF
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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ${entidad}Service } from './$entidad_lower.service';
import { Create${entidad}Dto } from './dto/create-$entidad_lower.dto';
import { Update${entidad}Dto } from './dto/update-$entidad_lower.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('$entidad')
@ApiBearerAuth('JWT-auth')
@Controller('$entidad_kebab')
export class ${entidad}Controller {
  constructor(
    private readonly ${entidad_lower}Service: ${entidad}Service,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear $entidad' })
  async create(@Body() create${entidad}Dto: Create${entidad}Dto) {
    const data = await this.${entidad_lower}Service.create(create${entidad}Dto);
    return {
      success: true,
      message: '$entidad creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    const uploadResult = await this.uploadService.uploadImage(file);
    const updated = await this.${entidad_lower}Service.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida exitosamente',
      data: { ${entidad_lower}: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos' })
  async findAll() {
    const data = await this.${entidad_lower}Service.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.${entidad_lower}Service.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar' })
  async update(
    @Param('id') id: string,
    @Body() update${entidad}Dto: Update${entidad}Dto,
  ) {
    const data = await this.${entidad_lower}Service.update(id, update${entidad}Dto);
    return {
      success: true,
      message: '$entidad actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar' })
  async remove(@Param('id') id: string) {
    const entity = await this.${entidad_lower}Service.findOne(id);
    if (entity.imagen) {
      const filename = entity.imagen.split('/').pop();
      if (filename) {
        await this.uploadService.deleteImage(filename);
      }
    }
    await this.${entidad_lower}Service.remove(id);
    return { success: true, message: '$entidad eliminado exitosamente' };
  }
}
CONTROLLEREOF

    # Module
    cat > "$proyecto/src/$entidad_lower/$entidad_lower.module.ts" << MODULEEOF
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ${entidad}Service } from './$entidad_lower.service';
import { ${entidad}Controller } from './$entidad_lower.controller';
import { ${entidad}, ${entidad}Schema } from './schemas/$entidad_lower.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ${entidad}.name, schema: ${entidad}Schema }
    ]),
    UploadModule,
  ],
  controllers: [${entidad}Controller],
  providers: [${entidad}Service],
  exports: [${entidad}Service],
})
export class ${entidad}Module {}
MODULEEOF

    echo "    ✅ Módulo $entidad creado"
}

# ===================================
# 4. CORREGIR UPLOAD SERVICE
# ===================================
corregir_upload_service() {
    local proyecto=$1
    
    cat > "$proyecto/src/upload/upload.service.ts" << 'UPLOADSERVICEEOF'
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';

export interface UploadResult {
  filename: string;
  url: string;
  thumbnailFilename: string;
  thumbnailUrl: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(file: any): Promise<UploadResult> {
    this.validateFile(file);

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const filename = timestamp + '-' + randomStr + ext;
    const thumbnailFilename = 'thumb-' + filename;

    const filepath = path.join(this.uploadDir, filename);
    const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);

    await fs.writeFile(filepath, file.buffer);

    await sharp(filepath)
      .resize(200, 200, { fit: 'cover' })
      .toFile(thumbnailPath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      filename,
      url: baseUrl + '/uploads/' + filename,
      thumbnailFilename,
      thumbnailUrl: baseUrl + '/uploads/' + thumbnailFilename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadMultipleImages(files: any[]): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron archivos');
    }

    if (files.length > 10) {
      throw new BadRequestException('Máximo 10 archivos permitidos');
    }

    return Promise.all(files.map((file) => this.uploadImage(file)));
  }

  async deleteImage(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    const thumbnailPath = path.join(this.uploadDir, 'thumb-' + filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file: ' + filename, error);
    }

    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      console.error('Error deleting thumbnail: thumb-' + filename, error);
    }
  }

  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo JPEG, PNG, GIF y WebP',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'Archivo muy grande. Máximo 5MB permitidos',
      );
    }
  }
}
UPLOADSERVICEEOF
    
    echo "    ✅ upload.service.ts corregido"
}

# ===================================
# 5. CORREGIR UPLOAD CONTROLLER
# ===================================
corregir_upload_controller() {
    local proyecto=$1
    
    cat > "$proyecto/src/upload/upload.controller.ts" << 'UPLOADCONTROLLEREOF'
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir una imagen' })
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: any) {
    const result = await this.uploadService.uploadImage(file);
    return {
      success: true,
      message: 'Imagen subida exitosamente',
      data: result,
    };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Subir múltiples imágenes (máx 10)' })
  @ApiConsumes('multipart/form-data')
  async uploadMultipleImages(@UploadedFiles() files: any[]) {
    const results = await this.uploadService.uploadMultipleImages(files);
    return {
      success: true,
      message: results.length + ' imágenes subidas exitosamente',
      data: results,
    };
  }
}
UPLOADCONTROLLEREOF
    
    echo "    ✅ upload.controller.ts corregido"
}

# ===================================
# 6. INSTALAR @types/multer
# ===================================
instalar_types_multer() {
    local proyecto=$1
    
    cd "$proyecto" || exit
    npm install --save-dev --silent @types/multer
    cd ..
    
    echo "    ✅ @types/multer instalado"
}

# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================

proyectos="edutech-api
ecomarket-api
perfulandia-api
fitlife-api
travelgo-api
artelab-api
greensolar-api
booksy-api
saborlocal-api
cineplus-api
agroverde-api
modaurbana-api
petsonline-api
reparafacil-api
aulaplus-api
saludconecta-api
reciclaapp-api
agrotech-api
educultura-api
mobilitygreen-api"

contador=0
total=20

for proyecto in $proyectos; do
    contador=$((contador + 1))
    
    if [ ! -d "$proyecto" ]; then
        echo -e "${YELLOW}⚠️  [$contador/$total] $proyecto no existe, saltando...${NC}"
        continue
    fi
    
    echo -e "${YELLOW}[$contador/$total]${NC} Corrigiendo ${GREEN}$proyecto${NC}..."
    
    roles=$(get_roles "$proyecto")
    entidades=$(get_entidades "$proyecto")
    
    # 1. Generar roles enum
    generar_roles_enum "$proyecto" "$roles"
    
    # 2. Corregir auth module
    corregir_auth_module "$proyecto"
    
    # 3. Generar módulos faltantes
    IFS=',' read -ra ENTIDADES <<< "$entidades"
    for entidad in "${ENTIDADES[@]}"; do
        entidad_lower=$(echo "$entidad" | tr '[:upper:]' '[:lower:]')
        if [ ! -f "$proyecto/src/$entidad_lower/$entidad_lower.module.ts" ]; then
            generar_modulo_entidad_completo "$proyecto" "$entidad"
        fi
    done
    
    # 4. Corregir upload
    corregir_upload_service "$proyecto"
    corregir_upload_controller "$proyecto"
    
    # 5. Instalar tipos
    instalar_types_multer "$proyecto"
    
    echo -e "  ${GREEN}✅ Proyecto corregido${NC}\n"
done

echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ TODOS LOS ERRORES CORREGIDOS              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}🧪 Probar ahora:${NC}"
echo "cd edutech-api && npm run start:dev"

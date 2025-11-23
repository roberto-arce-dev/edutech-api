import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InscripcionService } from './inscripcion.service';
import { InscripcionController } from './inscripcion.controller';
import { UploadModule } from '../upload/upload.module';
import { Inscripcion, InscripcionSchema } from './schemas/inscripcion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inscripcion.name, schema: InscripcionSchema }]),
    UploadModule,
  ],
  controllers: [InscripcionController],
  providers: [InscripcionService],
  exports: [InscripcionService],
})
export class InscripcionModule {}

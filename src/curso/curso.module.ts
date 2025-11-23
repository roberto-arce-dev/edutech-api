import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { UploadModule } from '../upload/upload.module';
import { Curso, CursoSchema } from './schemas/curso.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Curso.name, schema: CursoSchema }]),
    UploadModule,
  ],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService],
})
export class CursoModule {}

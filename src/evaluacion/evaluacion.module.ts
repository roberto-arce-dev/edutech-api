import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluacionService } from './evaluacion.service';
import { EvaluacionController } from './evaluacion.controller';
import { UploadModule } from '../upload/upload.module';
import { Evaluacion, EvaluacionSchema } from './schemas/evaluacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evaluacion.name, schema: EvaluacionSchema }]),
    UploadModule,
  ],
  controllers: [EvaluacionController],
  providers: [EvaluacionService],
  exports: [EvaluacionService],
})
export class EvaluacionModule {}

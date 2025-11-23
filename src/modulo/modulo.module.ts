import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuloService } from './modulo.service';
import { ModuloController } from './modulo.controller';
import { UploadModule } from '../upload/upload.module';
import { Modulo, ModuloSchema } from './schemas/modulo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Modulo.name, schema: ModuloSchema }]),
    UploadModule,
  ],
  controllers: [ModuloController],
  providers: [ModuloService],
  exports: [ModuloService],
})
export class ModuloModule {}

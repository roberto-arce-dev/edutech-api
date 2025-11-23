import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EstudianteProfile, EstudianteProfileSchema } from './schemas/estudiante-profile.schema';
import { EstudianteProfileService } from './estudiante-profile.service';
import { EstudianteProfileController } from './estudiante-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EstudianteProfile.name, schema: EstudianteProfileSchema },
    ]),
  ],
  controllers: [EstudianteProfileController],
  providers: [EstudianteProfileService],
  exports: [EstudianteProfileService],
})
export class EstudianteProfileModule {}

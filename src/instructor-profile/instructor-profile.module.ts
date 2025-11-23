import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructorProfile, InstructorProfileSchema } from './schemas/instructor-profile.schema';
import { InstructorProfileService } from './instructor-profile.service';
import { InstructorProfileController } from './instructor-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstructorProfile.name, schema: InstructorProfileSchema },
    ]),
  ],
  controllers: [InstructorProfileController],
  providers: [InstructorProfileService],
  exports: [InstructorProfileService],
})
export class InstructorProfileModule {}

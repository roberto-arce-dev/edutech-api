import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InstructorProfile, InstructorProfileDocument } from './schemas/instructor-profile.schema';
import { CreateInstructorProfileDto } from './dto/create-instructor-profile.dto';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto';

@Injectable()
export class InstructorProfileService {
  constructor(
    @InjectModel(InstructorProfile.name) private instructorprofileModel: Model<InstructorProfileDocument>,
  ) {}

  async create(userId: string, dto: CreateInstructorProfileDto): Promise<InstructorProfile> {
    const profile = await this.instructorprofileModel.create({
      user: new Types.ObjectId(userId),
      ...dto,
    });
    return profile;
  }

  async findByUserId(userId: string): Promise<InstructorProfile | null> {
    return this.instructorprofileModel.findOne({ user: new Types.ObjectId(userId) }).populate('user', 'email role').exec();
  }

  async findAll(): Promise<InstructorProfile[]> {
    return this.instructorprofileModel.find().populate('user', 'email role').exec();
  }

  async update(userId: string, dto: UpdateInstructorProfileDto): Promise<InstructorProfile> {
    const profile = await this.instructorprofileModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $set: dto },
      { new: true },
    );
    if (!profile) {
      throw new NotFoundException('Profile no encontrado');
    }
    return profile;
  }

  async delete(userId: string): Promise<void> {
    const result = await this.instructorprofileModel.deleteOne({ user: new Types.ObjectId(userId) });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Profile no encontrado');
    }
  }
}

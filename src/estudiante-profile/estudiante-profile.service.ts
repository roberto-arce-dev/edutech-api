import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EstudianteProfile, EstudianteProfileDocument } from './schemas/estudiante-profile.schema';
import { CreateEstudianteProfileDto } from './dto/create-estudiante-profile.dto';
import { UpdateEstudianteProfileDto } from './dto/update-estudiante-profile.dto';

@Injectable()
export class EstudianteProfileService {
  constructor(
    @InjectModel(EstudianteProfile.name) private estudianteprofileModel: Model<EstudianteProfileDocument>,
  ) {}

  async create(userId: string, dto: CreateEstudianteProfileDto): Promise<EstudianteProfile> {
    const profile = await this.estudianteprofileModel.create({
      user: userId,
      ...dto,
    });
    return profile;
  }

  async findByUserId(userId: string): Promise<EstudianteProfile | null> {
    return this.estudianteprofileModel.findOne({ user: userId }).populate('user', 'email role').exec();
  }

  async findAll(): Promise<EstudianteProfile[]> {
    return this.estudianteprofileModel.find().populate('user', 'email role').exec();
  }

  async update(userId: string, dto: UpdateEstudianteProfileDto): Promise<EstudianteProfile> {
    const profile = await this.estudianteprofileModel.findOneAndUpdate(
      { user: userId },
      { $set: dto },
      { new: true },
    );
    if (!profile) {
      throw new NotFoundException('Profile no encontrado');
    }
    return profile;
  }

  async delete(userId: string): Promise<void> {
    const result = await this.estudianteprofileModel.deleteOne({ user: userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Profile no encontrado');
    }
  }
}

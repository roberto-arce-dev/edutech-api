import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type InstructorProfileDocument = InstructorProfile & Document;

/**
 * InstructorProfile - Profile de negocio para rol INSTRUCTOR
 * Siguiendo el patrón DDD: User maneja auth, Profile maneja datos de negocio
 */
@Schema({ timestamps: true })
export class InstructorProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User | Types.ObjectId;

  @Prop({ required: true })
  nombreCompleto: string;

  @Prop()
  telefono?: string;

  @Prop()
  especialidad?: string;

  @Prop()
  biografia?: string;

  @Prop({ type: [String], default: [] })
  certificaciones?: string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const InstructorProfileSchema = SchemaFactory.createForClass(InstructorProfile);

// Indexes para optimizar queries
InstructorProfileSchema.index({ user: 1 });

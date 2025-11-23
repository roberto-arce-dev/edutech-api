import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type EstudianteProfileDocument = EstudianteProfile & Document;

/**
 * EstudianteProfile - Profile de negocio para rol ESTUDIANTE
 * Siguiendo el patrón DDD: User maneja auth, Profile maneja datos de negocio
 */
@Schema({ timestamps: true })
export class EstudianteProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: User | Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  telefono?: string;

  @Prop()
  nivel?: string;

  @Prop({ type: [String], default: [] })
  preferencias?: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const EstudianteProfileSchema = SchemaFactory.createForClass(EstudianteProfile);

// Indexes para optimizar queries
EstudianteProfileSchema.index({ user: 1 });

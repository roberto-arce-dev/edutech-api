import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CursoDocument = Curso & Document;

@Schema({ timestamps: true })
export class Curso {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  instructor: Types.ObjectId;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

  @Prop({ default: 0 })
  duracionHoras?: number;

  @Prop({ enum: ['basico', 'intermedio', 'avanzado'], default: 'basico' })
  nivel?: string;

  @Prop({ default: 0 })
  precio?: number;

  @Prop({ type: [String], default: [] })
  requisitos?: any;

  @Prop({ type: [String], default: [] })
  objetivos?: any;

  @Prop({ default: true })
  activo?: boolean;

}

export const CursoSchema = SchemaFactory.createForClass(Curso);

CursoSchema.index({ instructor: 1 });
CursoSchema.index({ nivel: 1 });
CursoSchema.index({ activo: 1 });
CursoSchema.index({ titulo: 'text', descripcion: 'text' });

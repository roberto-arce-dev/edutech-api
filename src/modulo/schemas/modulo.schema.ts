import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModuloDocument = Modulo & Document;

@Schema({ timestamps: true })
export class Modulo {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: Types.ObjectId, ref: 'Curso', required: true })
  curso: Types.ObjectId;

  @Prop({ required: true })
  orden: number;

  @Prop()
  contenido?: string;

  @Prop({ default: 0 })
  duracionMinutos?: number;

  @Prop()
  videoUrl?: string;

  @Prop({ type: [String], default: [] })
  recursos?: any;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

  @Prop({ default: true })
  publicado?: boolean;

}

export const ModuloSchema = SchemaFactory.createForClass(Modulo);

ModuloSchema.index({ curso: 1, orden: 1 });
ModuloSchema.index({ publicado: 1 });

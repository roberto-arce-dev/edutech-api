import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InscripcionDocument = Inscripcion & Document;

@Schema({ timestamps: true })
export class Inscripcion {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Curso', required: true })
  curso: Types.ObjectId;

  @Prop({ default: Date.now })
  fechaInscripcion?: Date;

  @Prop({ enum: ['activa', 'completada', 'abandonada', 'suspendida'], default: 'activa' })
  estado?: string;

  @Prop({ default: 0, min: 0, max: 100 })
  progreso?: number;

  @Prop()
  fechaCompletado?: Date;

  @Prop({ default: 0 })
  calificacionFinal?: number;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const InscripcionSchema = SchemaFactory.createForClass(Inscripcion);

InscripcionSchema.index({ usuario: 1, curso: 1 }, { unique: true });
InscripcionSchema.index({ estado: 1 });
InscripcionSchema.index({ fechaInscripcion: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EvaluacionDocument = Evaluacion & Document;

@Schema({ timestamps: true })
export class Evaluacion {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  descripcion?: string;

  @Prop({ type: Types.ObjectId, ref: 'Modulo', required: true })
  modulo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ min: 0, max: 100 })
  nota: number;

  @Prop({ default: 1 })
  intento?: number;

  @Prop({ default: false })
  aprobada?: boolean;

  @Prop()
  fechaRealizacion?: Date;

  @Prop({ type: Object })
  respuestas?: any;

  @Prop()
  tiempoMinutos?: number;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const EvaluacionSchema = SchemaFactory.createForClass(Evaluacion);

EvaluacionSchema.index({ modulo: 1, usuario: 1 });
EvaluacionSchema.index({ usuario: 1, fechaRealizacion: -1 });
EvaluacionSchema.index({ aprobada: 1 });

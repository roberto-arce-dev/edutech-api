import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true })
  nombre: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  avatar?: string;

  @Prop()
  telefono?: string;

  @Prop({ default: 'estudiante', enum: ['estudiante', 'profesor', 'admin'] })
  rol?: string;

  @Prop()
  bio?: string;

  @Prop()
  imagen?: string;

  @Prop()
  imagenThumbnail?: string;

}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ rol: 1 });

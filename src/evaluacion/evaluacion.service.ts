import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { Evaluacion, EvaluacionDocument } from './schemas/evaluacion.schema';

@Injectable()
export class EvaluacionService {
  constructor(
    @InjectModel(Evaluacion.name) private evaluacionModel: Model<EvaluacionDocument>,
  ) {}

  async create(createEvaluacionDto: CreateEvaluacionDto): Promise<Evaluacion> {
    const nuevoEvaluacion = await this.evaluacionModel.create(createEvaluacionDto);
    return nuevoEvaluacion;
  }

  async findAll(): Promise<Evaluacion[]> {
    const evaluacions = await this.evaluacionModel.find()
      .populate('modulo', 'titulo descripcion orden')
      .populate('usuario', 'nombre email avatar');
    return evaluacions;
  }

  async findOne(id: string | number): Promise<Evaluacion> {
    const evaluacion = await this.evaluacionModel.findById(id)
      .populate('modulo', 'titulo descripcion orden')
      .populate('usuario', 'nombre email avatar');
    if (!evaluacion) {
      throw new NotFoundException(`Evaluacion con ID ${id} no encontrado`);
    }
    return evaluacion;
  }

  async update(id: string | number, updateEvaluacionDto: UpdateEvaluacionDto): Promise<Evaluacion> {
    const evaluacion = await this.evaluacionModel.findByIdAndUpdate(id, updateEvaluacionDto, { new: true })
      .populate('modulo', 'titulo descripcion orden')
      .populate('usuario', 'nombre email avatar')
    .populate('modulo', 'titulo curso')
    .populate('usuario', 'nombre email');
    if (!evaluacion) {
      throw new NotFoundException(`Evaluacion con ID ${id} no encontrado`);
    }
    return evaluacion;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.evaluacionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Evaluacion con ID ${id} no encontrado`);
    }
  }

  async findByCurso(cursoId: string): Promise<Evaluacion[]> {
    const evaluaciones = await this.evaluacionModel.find()
      .populate({
        path: 'modulo',
        match: { curso: new Types.ObjectId(cursoId) },
        select: 'titulo descripcion orden curso'
      })
      .populate('usuario', 'nombre email avatar')
      .sort({ fechaEvaluacion: -1 });
    
    // Filtrar evaluaciones donde el módulo pertenece al curso
    return evaluaciones.filter(evaluacion => evaluacion.modulo);
  }

  async findByUsuario(usuarioId: string): Promise<Evaluacion[]> {
    const evaluaciones = await this.evaluacionModel.find({ usuario: new Types.ObjectId(usuarioId) })
      .populate({
        path: 'modulo',
        select: 'titulo descripcion orden curso',
        populate: {
          path: 'curso',
          select: 'titulo descripcion'
        }
      })
      .populate('usuario', 'nombre email avatar')
      .sort({ fechaEvaluacion: -1 });
    return evaluaciones;
  }
}

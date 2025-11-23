import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Modulo, ModuloDocument } from './schemas/modulo.schema';

@Injectable()
export class ModuloService {
  constructor(
    @InjectModel(Modulo.name) private moduloModel: Model<ModuloDocument>,
  ) {}

  async create(createModuloDto: CreateModuloDto): Promise<Modulo> {
    const nuevoModulo = await this.moduloModel.create(createModuloDto);
    return nuevoModulo;
  }

  async findAll(): Promise<Modulo[]> {
    const modulos = await this.moduloModel.find().populate('curso', 'titulo descripcion nivel');
    return modulos;
  }

  async findOne(id: string | number): Promise<Modulo> {
    const modulo = await this.moduloModel.findById(id).populate('curso', 'titulo descripcion nivel');
    if (!modulo) {
      throw new NotFoundException(`Modulo con ID ${id} no encontrado`);
    }
    return modulo;
  }

  async update(id: string | number, updateModuloDto: UpdateModuloDto): Promise<Modulo> {
    const modulo = await this.moduloModel.findByIdAndUpdate(id, updateModuloDto, { new: true }).populate('curso', 'titulo descripcion nivel')
    if (!modulo) {
      throw new NotFoundException(`Modulo con ID ${id} no encontrado`);
    }
    return modulo;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.moduloModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Modulo con ID ${id} no encontrado`);
    }
  }
}

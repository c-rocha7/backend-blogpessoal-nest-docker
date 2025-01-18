import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { TemaService } from '../services/tema.service';
import { Tema } from '../entities/tema.entity';

@Controller('/temas')
export class TemaController {
  constructor(private readonly temaRepository: TemaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Tema[]> {
    return this.temaRepository.findAll();
  }
}

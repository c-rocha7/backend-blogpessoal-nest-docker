import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
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

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Tema> {
    return this.temaRepository.findById(id);
  }

  @Get('/descricao/:descricao')
  @HttpCode(HttpStatus.OK)
  findByDescricao(@Param('descricao') descricao: string): Promise<Tema[]> {
    return this.temaRepository.findByDescricao(descricao);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() tema: Tema): Promise<Tema> {
    return this.temaRepository.create(tema);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Tema', () => {
  let token: any;
  let temaId: any;
  let temaDescricao: any;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/entities/*.entity.{ts,js}'],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const createUser = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(201);

    const singInUser = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      })
      .expect(200);

    token = singInUser.body.token;
  });

  it('01 - Deve Cadastrar um novo tema', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/temas/')
      .set('Authorization', `${token}`)
      .send({
        descricao: 'Lorem Ipsum',
      })
      .expect(201);

    temaId = resposta.body.id;
    temaDescricao = resposta.body.descricao;
  });

  it('02 - Deve Listar todos os Temas', async () => {
    return request(app.getHttpServer())
      .get('/temas')
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('03 - Deve Retornar um Tema', async () => {
    return request(app.getHttpServer())
      .get(`/temas/${temaId}`)
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('04 - Deve Listar todos os Temas pela Descrição', async () => {
    return request(app.getHttpServer())
      .get(`/temas/descricao/${temaDescricao}`)
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('05 - Deve Atualizar um Tema', async () => {
    return request(app.getHttpServer())
      .put('/temas')
      .set('Authorization', `${token}`)
      .send({
        id: temaId,
        descricao: 'Lorem Ipsum Atualizado',
      })
      .expect(200)
      .then((resposta) => {
        expect('Lorem Ipsum Atualizado').toEqual(resposta.body.descricao);
      });
  });

  it('06 - Deve Deletar um Tema', async () => {
    return request(app.getHttpServer())
      .delete(`/temas/${temaId}`)
      .set('Authorization', `${token}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});

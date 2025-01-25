import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes dos Módulos Postagem', () => {
  let token: any;
  let usuarioId: any;
  let temaId: any;
  let postagemId: any;
  let postagemTitulo: any;
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

    usuarioId = createUser.body.id;

    const singInUser = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      })
      .expect(200);

    token = singInUser.body.token;

    const createTema = await request(app.getHttpServer())
      .post('/temas/')
      .set('Authorization', `${token}`)
      .send({
        descricao: 'Lorem Ipsum',
      })
      .expect(201);

    temaId = createTema.body.id;
  });

  it('01 - Deve Cadastrar uma nova Postagem', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/postagens')
      .set('Authorization', `${token}`)
      .send({
        usuario: { id: usuarioId },
        tema: { id: temaId },
        titulo: 'Título da Postagem',
        texto: 'Lorem Ipsum',
      })
      .expect(201);

    postagemId = resposta.body.id;
    postagemTitulo = resposta.body.titulo;
  });

  it('02 - Deve Listar todas as Postagens', async () => {
    return request(app.getHttpServer())
      .get('/postagens')
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('03 - Deve Retornar uma Postagem', async () => {
    return request(app.getHttpServer())
      .get(`/postagens/${postagemId}`)
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('04 - Deve Listar todas as Postagens pelo Título', async () => {
    return request(app.getHttpServer())
      .get(`/postagens/titulo/${postagemTitulo}`)
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('05 - Deve Atualizar um Tema', async () => {
    return request(app.getHttpServer())
      .put('/postagens')
      .set('Authorization', `${token}`)
      .send({
        id: postagemId,
        titulo: 'Título da Postagem Atualizado',
        texto: 'Lorem Ipsum Atualizado',
        usuario: { id: usuarioId },
        tema: { id: temaId },
      })
      .expect(200)
      .then((resposta) => {
        expect('Título da Postagem Atualizado').toEqual(resposta.body.titulo);
      });
  });

  it('06 - Deve Deletar uma Postagem', async () => {
    return request(app.getHttpServer())
      .delete(`/postagens/${postagemId}`)
      .set('Authorization', `${token}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});

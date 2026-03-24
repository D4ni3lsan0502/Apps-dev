const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

// Setting up a mocked app with routes
const app = express();
app.use(express.json());

// Set up fake auth middleware to mock being logged in
const authMiddlewareMock = (req, res, next) => {
  req.user = { id: 'mock_cliente_id', roles: ['cliente'] };
  next();
};

jest.mock('../src/middlewares/authMiddleware', () => authMiddlewareMock);

const authRoutes = require('../src/routes/authRoutes');
const agendamentoRoutes = require('../src/routes/agendamentoRoutes');

app.use('/api', authRoutes);
app.use('/api/agendamentos', agendamentoRoutes);

describe('API Validation Tests', () => {
  it('should validate inputs on /api/login and fail for empty body', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
    // email inválido, senha vazia, tipo vazio
    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('should validate inputs on /api/cadastro and fail for empty body', async () => {
    const res = await request(app).post('/api/cadastro').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('should validate inputs on POST /api/agendamentos and fail if empty', async () => {
     const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', 'Bearer fake_token')
      .send({});

     expect(res.statusCode).toEqual(400);
     expect(res.body.errors).toBeDefined();
  });
});

describe('Authentication & Cadastro Tests', () => {
  let User;
  beforeAll(() => {
    User = require('../models/User');
    // Mock the Mongoose save and find operations for User
    User.prototype.save = jest.fn().mockResolvedValue({});
    User.findOne = jest.fn().mockResolvedValue(null); // Simulate no existing user
    User.create = jest.fn().mockResolvedValue({ _id: 'mock_user_id', nome: 'Mock User', email: 'mock@test.com' });
  });

  it('should successfully register a Barbeiro', async () => {
     const payload = {
        nome: 'Test Barbeiro',
        email: 'barbeiro@test.com',
        senha: 'password123',
        tipo: 'barbeiro'
     };

     const res = await request(app)
        .post('/api/cadastro')
        .send(payload);

     expect(res.statusCode).toEqual(201);
     expect(res.body.message).toContain('sucesso');
     expect(User.create).toHaveBeenCalled();
  });

  it('should successfully register a Cliente', async () => {
     const payload = {
        nome: 'Test Cliente',
        email: 'cliente@test.com',
        senha: 'password123',
        cep: '01001000',
        rua: 'Rua Teste',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        atendimento: 'barbearia'
     };

     const res = await request(app)
        .post('/api/clientes')
        .send(payload);

     expect(res.statusCode).toEqual(201);
     expect(res.body.message).toContain('sucesso');
     expect(User.create).toHaveBeenCalled();
  });

  it('should fail login with wrong email', async () => {
     User.findOne.mockResolvedValueOnce(null); // No user found
     const res = await request(app).post('/api/login').send({ email: 'wrong@test.com', senha: '123', tipo: 'cliente' });
     expect(res.statusCode).toEqual(400);
     expect(res.body.message).toContain('Usuário não encontrado');
  });

  it('should fail login if user lacks required role', async () => {
     User.findOne.mockResolvedValueOnce({ roles: ['barbeiro'] });
     const res = await request(app).post('/api/login').send({ email: 'barbeiro@test.com', senha: '123', tipo: 'cliente' });
     expect(res.statusCode).toEqual(403);
     expect(res.body.message).toContain('Usuário não possui a função necessária');
  });
});

describe('User Protected Routes Mock Tests', () => {
  let User;
  beforeAll(() => {
    User = require('../models/User');
    User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'mock_user_id', nome: 'Mock User' })
    });
  });

  it('should allow fetching perfil', async () => {
      const userRoutes = require('../src/routes/userRoutes');
      app.use('/api/users', userRoutes);

      const res = await request(app)
        .get('/api/users/perfil')
        .set('Authorization', 'Bearer fake_token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.nome).toBe('Mock User');
  });
});

describe('Agendamento Controller Mock Tests', () => {
  let Agendamento;
  beforeAll(() => {
    Agendamento = require('../models/Agendamento');
    // Mock the Mongoose save and find operations
    Agendamento.prototype.save = jest.fn().mockResolvedValue({});
    Agendamento.find = jest.fn().mockResolvedValue([{ id: 'mock_agendamento' }]);
  });

  it('should allow fetching agendamentos through the mocked API route', async () => {
      const res = await request(app)
        .get('/api/agendamentos')
        .set('Authorization', 'Bearer fake_token');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(Agendamento.find).toHaveBeenCalled();
  });

  it('should create an agendamento when valid payload is sent', async () => {
     const payload = {
        barbeiroId: 'barb_123',
        data: '2025-10-10',
        horario: '14:00',
        valorTotal: 50.00
     };

     const res = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', 'Bearer fake_token')
        .send(payload);

     expect(res.statusCode).toEqual(201);
     expect(Agendamento.prototype.save).toHaveBeenCalled();
  });
});

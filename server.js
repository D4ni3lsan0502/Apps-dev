require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

// Verifica se as variáveis de ambiente existem
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('❌ Variáveis de ambiente MONGODB_URI ou JWT_SECRET não configuradas.');
  process.exit(1);
}

// NÃO imprima variáveis sensíveis em produção
if (process.env.NODE_ENV !== 'production') {
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'OK' : 'NÃO ENCONTRADA');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'OK' : 'NÃO ENCONTRADA');
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL // URL de produção (Railway, Vercel, etc)
].filter(Boolean); // Remove falsy values if FRONTEND_URL is undefined

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como ferramentas do mesmo servidor ou cURL)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS deste site não permite o acesso a partir da Origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB (sem opções deprecated)
if (process.env.USE_MEMORY_DB === 'true') {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  MongoMemoryServer.create().then((mongoServer) => {
    mongoose.connect(mongoServer.getUri())
      .then(() => console.log('✅ MongoDB em Memória conectado!'))
      .catch(err => console.error('❌ Erro ao conectar ao MongoDB em Memória:', err));
  });
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado!'))
    .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));
}

// Rotas
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const agendamentoRoutes = require('./src/routes/agendamentoRoutes');

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/agendamentos', agendamentoRoutes);

const auth = require('./src/middlewares/authMiddleware');
const userController = require('./src/controllers/userController');
app.get('/usuarios', auth, userController.getUsers);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

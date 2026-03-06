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
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB (sem opções deprecated)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rotas
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/api', authRoutes);
app.use('/api', userRoutes);

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

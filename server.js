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

// Teste de leitura das variáveis
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'OK' : 'NÃO ENCONTRADA');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'OK' : 'NÃO ENCONTRADA');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB (sem opções deprecated)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rotas

// Cadastro de usuário (cliente ou barbeiro)
app.post('/api/cadastro', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  if (!nome || !email || !senha || !tipo) return res.status(400).json({ message: 'Dados obrigatórios.' });

  const hash = await bcrypt.hash(senha, 10);
  try {
    const user = await User.create({ nome, email, senha: hash, tipo });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(400).json({ message: 'Email já cadastrado.' });
  }
});

// Login real com JWT
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });

  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) return res.status(400).json({ message: 'Senha incorreta.' });

  const token = jwt.sign({ id: user._id, tipo: user.tipo }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { nome: user.nome, email: user.email, tipo: user.tipo } });
});

// Middleware de autenticação
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido.' });
  }
}

// Rota protegida de exemplo
app.get('/api/perfil', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-senha');
  res.json(user);
});

// Rota para obter todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await db.collection('usuarios').find().toArray();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

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

// Função auxiliar para adicionar role ou criar novo usuário
async function addRoleOrCreateUser({ nome, email, senha, tipo, extraFields = {} }) {
    let user = await User.findOne({ email });

    if (user) {
        // User exists, add new role if it doesn't exist
        if (!user.roles.includes(tipo)) {
            user.roles.push(tipo);
            Object.assign(user, extraFields); // Atualiza campos extras se fornecidos
            await user.save();
            return { status: 200, message: 'Role added successfully!', user };
        } else {
            return { status: 400, message: 'User with this role already exists.' };
        }
    } else {
        // User does not exist, create new user
        const hash = await bcrypt.hash(senha, 10);
        user = await User.create({ nome, email, senha: hash, roles: [tipo], ...extraFields });
        return { status: 201, message: 'Usuário cadastrado com sucesso!', user };
    }
}

// Cadastro de usuário (cliente ou barbeiro)
app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !tipo) return res.status(400).json({ message: 'Dados obrigatórios.' });

    try {
        const result = await addRoleOrCreateUser({ nome, email, senha, tipo });
        if (result.status === 200) {
            return res.status(200).json({ message: result.message });
        } else if (result.status === 201) {
            return res.status(201).json({ message: result.message });
        } else {
            return res.status(result.status).json({ message: result.message });
        }
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).json({ message: 'Erro ao cadastrar no banco de dados.' });
    }
});

// Login real com JWT
app.post('/api/login', async (req, res) => {
    const { email, senha, tipo } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });

    if (!user.roles.includes(tipo)) {
        return res.status(403).json({ message: 'Usuário não possui a função necessária.' });
    }

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) return res.status(400).json({ message: 'Senha incorreta.' });

    const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { nome: user.nome, email: user.email, roles: user.roles } });
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

// Rota para obter todos os usuários (PROTEGIDA)
app.get('/usuarios', auth, async (req, res) => {
  try {
    const usuarios = await User.find().select('-senha');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

// Cadastro de cliente (enviado pelo formulário HTML)
app.post('/api/clientes', async (req, res) => {
    const {
        nome,
        email,
        senha,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        atendimento
    } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        const result = await addRoleOrCreateUser({
            nome,
            email,
            senha,
            tipo: 'cliente',
            extraFields: { cep, rua, bairro, cidade, estado, atendimento }
        });
        if (result.status === 200) {
            return res.status(200).json({ message: result.message });
        } else if (result.status === 201) {
            return res.status(201).json({ message: 'Cliente cadastrado com sucesso!', cliente: result.user });
        } else {
            return res.status(result.status).json({ message: result.message });
        }
    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        res.status(500).json({ message: 'Erro ao cadastrar no banco de dados.' });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

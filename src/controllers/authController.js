const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: errors.array()[0].msg });
    }

    const { nome, email, senha, tipo } = req.body;

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
};

// Login real com JWT
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: errors.array()[0].msg });
    }

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
};

// Cadastro de cliente (enviado pelo formulário HTML)
exports.registerClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: errors.array()[0].msg });
    }

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
};

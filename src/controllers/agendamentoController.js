const Agendamento = require('../../models/Agendamento');
const { validationResult } = require('express-validator');

exports.createAgendamento = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const agendamento = new Agendamento({
            ...req.body,
            clienteId: req.user.id // Pegando o ID do cliente logado pelo token JWT
        });
        await agendamento.save();
        res.status(201).json(agendamento);
    } catch (err) {
        console.error('Erro ao criar agendamento:', err);
        res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
};

exports.getAgendamentos = async (req, res) => {
    try {
        // Se for barbeiro, busca agendamentos dele. Se for cliente, busca agendamentos dele.
        let query = {};
        if (req.user.roles.includes('barbeiro')) {
            query.barbeiroId = req.user.id;
        } else if (req.user.roles.includes('cliente')) {
            query.clienteId = req.user.id;
        }

        const agendamentos = await Agendamento.find(query);
        res.json(agendamentos);
    } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
};

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const agendamento = await Agendamento.findById(req.params.id);

        if (!agendamento) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        // Simples validação de segurança (barbeiro ou o próprio cliente podem cancelar)
        if (req.user.id !== agendamento.clienteId.toString() && req.user.id !== agendamento.barbeiroId.toString()) {
             return res.status(403).json({ message: 'Não autorizado a alterar este agendamento' });
        }

        agendamento.status = status;
        await agendamento.save();

        res.json(agendamento);
    } catch (err) {
        console.error('Erro ao atualizar agendamento:', err);
        res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
};

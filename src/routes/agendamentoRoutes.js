const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const auth = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

// Create a new appointment
router.post('/', auth, [
    body('barbeiroId').notEmpty().withMessage('O ID do barbeiro é obrigatório.'),
    body('data').notEmpty().withMessage('A data é obrigatória.'),
    body('horario').notEmpty().withMessage('O horário é obrigatório.'),
    body('valorTotal').isNumeric().withMessage('O valor total é obrigatório e deve ser número.')
], agendamentoController.createAgendamento);

// Get appointments for the logged in user (works for both client and barber)
router.get('/', auth, agendamentoController.getAgendamentos);

// Update status
router.put('/:id/status', auth, [
    body('status').isIn(['pendente', 'confirmado', 'concluido', 'cancelado']).withMessage('Status inválido.')
], agendamentoController.updateStatus);

module.exports = router;

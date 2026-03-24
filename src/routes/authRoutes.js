const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

router.post('/cadastro', [
    body('nome').notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
    body('tipo').notEmpty().withMessage('Tipo é obrigatório.')
], authController.register);

router.post('/login', [
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').notEmpty().withMessage('Senha é obrigatória.'),
    body('tipo').notEmpty().withMessage('Tipo é obrigatório.')
], authController.login);

router.post('/clientes', [
    body('nome').notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.')
], authController.registerClient);

module.exports = router;

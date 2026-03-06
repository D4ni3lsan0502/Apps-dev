const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

// We'll map these nicely so we don't have to change server.js as much.

// Let's use this router on /api
router.get('/perfil', auth, userController.getProfile);

module.exports = router;

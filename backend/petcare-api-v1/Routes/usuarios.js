const express = require('express');
const router = express.Router();

const authController = require('../Controllers/authController');
const usuariosController = require('../Controllers/usuariosController');
const authMiddleware = require('../Middlewares/authMiddleware');

router.get('/me', authMiddleware, authController.me);

router.put('/me', authMiddleware, usuariosController.atualizarMeuPerfil);

module.exports = router;
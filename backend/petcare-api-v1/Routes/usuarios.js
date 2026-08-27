const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, authController.me);

router.put('/me', authMiddleware, usuariosController.atualizarMeuPerfil);

module.exports = router;
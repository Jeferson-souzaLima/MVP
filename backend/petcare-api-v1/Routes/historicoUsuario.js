const express = require('express');
const router = express.Router();
const controller = require('../Controllers/historicoUsuarioController');
const authMiddleware = require('../Middlewares/authMiddleware');

router.get('/me', authMiddleware, controller.getHistoricoUsuario);

module.exports = router;
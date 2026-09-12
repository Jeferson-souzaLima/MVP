const express = require('express');
const router = express.Router();

const buscaController = require('../Controllers/buscaController');
const authOptionalMiddleware = require('../Middlewares/authOptionalMiddleware');

router.get(
    '/',
    authOptionalMiddleware,
    buscaController.buscar
);

router.get(
    '/resultados',
    authOptionalMiddleware,
    buscaController.buscarResultados
);

module.exports = router;
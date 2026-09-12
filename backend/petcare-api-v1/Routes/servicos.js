const express = require('express');
const router = express.Router();
const servicosController = require('../Controllers/servicosController');
const authMiddleware = require('../Middlewares/authMiddleware');
const authorizeRoles = require('../Middlewares/authorizeRoles');

//
// ===============================
// ?? ROTAS PROTEGIDAS (LOJISTA)
// ===============================

// Meus serviços (vem do token)
router.get(
    '/meus',
    authMiddleware,
    authorizeRoles('lojista'),
    servicosController.listarMeusServicos
);

router.post(
    '/',
    authMiddleware,
    authorizeRoles('lojista'),
    servicosController.criarServico
);

router.put(
    '/:id',
    authMiddleware,
    authorizeRoles('lojista'),
    servicosController.atualizarServico
);

router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('lojista'),
    servicosController.deletarServico
);

//
// ===============================
// ?? ROTAS PÚBLICAS
// ===============================

// Serviços de uma loja específica (ativos)
router.get('/loja/:id', servicosController.listarServicosPorLoja);

// Lista todos (se quiser manter público)
router.get('/', servicosController.listarServicos);

// Detalhe (somente ativo)
router.get('/:id', servicosController.getServico);

module.exports = router;
const express = require('express');
const router = express.Router();
const AgendaLojistaController = require('../controllers/agendaLojistaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autentica��o
router.use(authMiddleware);

// ========================
// Configura��o da Agenda
// ========================
router.get('/config', AgendaLojistaController.getConfig);
router.post('/config', AgendaLojistaController.createOrUpdateConfig);

// ========================
// Disponibilidade
// ========================
router.get('/disponibilidade', AgendaLojistaController.getDisponibilidade);
router.post('/disponibilidade', AgendaLojistaController.createDisponibilidade);

// ?? A rota espec�fica deve vir antes da rota din�mica
router.delete(
    '/disponibilidade/loja',
    AgendaLojistaController.deleteDisponibilidadeByLoja
);

router.delete(
    '/disponibilidade/:id',
    AgendaLojistaController.deleteDisponibilidade
);

router.get('/horarios', AgendaLojistaController.getHorariosDisponiveis);

// ========================
// Bloqueios
// ========================
router.get('/bloqueios', AgendaLojistaController.getBloqueios);
router.post('/bloqueios', AgendaLojistaController.createBloqueio);
router.delete('/bloqueios/:id', AgendaLojistaController.deleteBloqueio);

module.exports = router;
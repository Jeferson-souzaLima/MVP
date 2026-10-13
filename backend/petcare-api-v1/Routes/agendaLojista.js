const express = require('express');
const router = express.Router();
const agendaLojistaController = require('../Controllers/agendaLojistaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autentica��o
router.use(authMiddleware);

// ========================
// Configura��o da Agenda
// ========================
router.get('/config', agendaLojistaController.getConfig);
router.post('/config', agendaLojistaController.createOrUpdateConfig);

// ========================
// Disponibilidade
// ========================
router.get('/disponibilidade', agendaLojistaController.getDisponibilidade);
router.post('/disponibilidade', agendaLojistaController.createDisponibilidade);

// ?? A rota espec�fica deve vir antes da rota din�mica
router.delete(
    '/disponibilidade/loja',
    agendaLojistaController.deleteDisponibilidadeByLoja
);

router.delete(
    '/disponibilidade/:id',
    agendaLojistaController.deleteDisponibilidade
);

router.get('/horarios', agendaLojistaController.getHorariosDisponiveis);

// ========================
// Bloqueios
// ========================
router.get('/bloqueios', agendaLojistaController.getBloqueios);
router.post('/bloqueios', agendaLojistaController.createBloqueio);
router.delete('/bloqueios/:id', agendaLojistaController.deleteBloqueio);

module.exports = router;

const express = require('express');
const router = express.Router();
const agendamentosController = require('../Controllers/agendamentosController');
const agendaLojistaController = require('../Controllers/agendaLojistaController');
const authMiddleware = require('../Middlewares/authMiddleware');

router.use(authMiddleware);

// Criar agendamento
router.post('/', agendamentosController.criarAgendamento);

// Manual
router.post('/manual', agendamentosController.criarAgendamentoManual);
router.put('/:id/manual', agendamentosController.editarAgendamentoManual);

// Listagens
router.get('/lojista', agendamentosController.getAgendamentosDoLojista);
router.get('/meus-agendamentos', agendamentosController.getMeusAgendamentos);
router.get('/pedido/:pedido_id', agendamentosController.getAgendamentosPorPedido);
router.get('/meus', authMiddleware, agendamentosController.getMeusAgendamentos);
router.get(
    '/lojista/datas-confirmadas',
    agendaLojistaController.getDatasComAgendamentosConfirmados
);

// Detalhe
router.get('/:id', agendamentosController.getAgendamentoPorId);

// Status
router.put('/:id/status', agendamentosController.atualizarStatus);
router.put('/:id/cancelar', agendamentosController.cancelarAgendamentoCliente
);

// Delete
router.delete('/:id', agendamentosController.deletarAgendamento);

module.exports = router;

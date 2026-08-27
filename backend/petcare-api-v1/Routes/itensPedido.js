const express = require('express');
const router = express.Router();
const itensPedidoController = require('../controllers/itensPedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
// Listar itens de um pedido
router.get('/:pedidoId', itensPedidoController.listarItensPedido);

// Adicionar item a um pedido
router.post('/', itensPedidoController.adicionarItemPedido);

// Atualizar um item de pedido
router.put('/:itemId', itensPedidoController.atualizarItemPedido);

// Deletar um item de pedido
router.delete('/:itemId', itensPedidoController.deletarItemPedido);

module.exports = router;

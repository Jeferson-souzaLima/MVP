const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');
const upload = require('../uploads/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');

// Produtos específicos do lojista/distribuidoras
router.get('/meus', authMiddleware, authorizeRoles('lojista'), produtosController.listarMeusProdutos);
router.get('/distribuidoras', authMiddleware, authorizeRoles('lojista'), produtosController.listarProdutosDistribuidoras);

// Produtos de uma loja específica (público)
router.get('/loja/:id', produtosController.listarProdutosPorLoja);

// CRUD público/admin
router.get('/', produtosController.listarProdutos);
router.get('/:id', produtosController.getProduto);

// CRUD protegido para lojista
router.post('/', authMiddleware, authorizeRoles('lojista'), produtosController.criarProduto);
router.put('/:id', authMiddleware, authorizeRoles('lojista'), produtosController.atualizarProduto);
router.delete('/:id', authMiddleware, authorizeRoles('lojista'), produtosController.deletarProduto);

// Upload de imagens
router.post('/:id/imagens', authMiddleware, authorizeRoles('lojista'), upload.array('imagens', 10), produtosController.uploadImagensProduto);
router.delete('/:produtoId/imagens/:imagemId', authMiddleware, authorizeRoles('lojista'), produtosController.deletarImagemProduto);
router.patch('/:produtoId/imagens/:imagemId/principal', authMiddleware, authorizeRoles('lojista'), produtosController.definirImagemPrincipal);

module.exports = router;
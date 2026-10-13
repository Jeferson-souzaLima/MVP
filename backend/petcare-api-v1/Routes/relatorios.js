const express = require('express');
const router = express.Router();
const relatoriosController = require('../Controllers/relatoriosController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');

router.get('/', authMiddleware, authorizeRoles('lojista'), relatoriosController.obterRelatorio);

module.exports = router;

const express = require('express');
const router = express.Router();
const relatoriosController = require('../Controllers/relatoriosController');
const authMiddleware = require('../Middlewares/authMiddleware');
const authorizeRoles = require('../Middlewares/authorizeRoles');

router.get('/', authMiddleware, authorizeRoles('lojista'), relatoriosController.obterRelatorio);

module.exports = router;

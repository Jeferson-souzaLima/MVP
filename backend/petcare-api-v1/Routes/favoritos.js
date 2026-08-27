const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const favoritoController = require("../Controllers/favoritosController");

// ===============================
// FAVORITOS
// ===============================

router.post(
    "/",
    auth,
    favoritoController.adicionar
);

router.delete(
    "/",
    auth,
    favoritoController.remover
);

router.get(
    "/",
    auth,
    favoritoController.listar 
);

router.get(
    "/status",
    auth,
    favoritoController.status
);

module.exports = router;
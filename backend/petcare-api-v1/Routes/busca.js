const express = require("express");
const router = express.Router();

const buscaController = require("../controllers/buscaController");

router.get("/", buscaController.buscar);
router.get("/resultados", buscaController.buscarResultados);

module.exports = router;
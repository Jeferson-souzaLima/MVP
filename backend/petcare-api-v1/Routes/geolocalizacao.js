const express = require("express");

const router = express.Router();

const auth = require("../Middlewares/authMiddleware");

const geolocalizacaoController = require("../Controllers/geolocalizacaoController");

router.post(
    "/",
    auth,
    geolocalizacaoController.buscar
);

module.exports = router;
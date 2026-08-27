const favoritoModel = require("../Models/favoritosModel");
const produtosModel = require("../Models/produtosModel");
const lojasModel = require("../Models/lojasModel");
const servicosModel = require("../Models/servicosModel");

const TIPOS_VALIDOS = [
    "produto",
    "loja",
    "servico",
];

function verificarExistencia(tipo, referenciaId, callback) {

    let model;

    switch (tipo) {

        case "produto":
            model = produtosModel;
            break;

        case "loja":
            model = lojasModel;
            break;

        case "servico":
            model = servicosModel;
            break;

        default:
            return callback(new Error("Tipo inválido."));
    }

    model.existePorId(referenciaId, (err, results) => {

        if (err) return callback(err);

        callback(null, results.length > 0);

    });

}

// ===============================
// ADICIONAR FAVORITO
// ===============================
exports.adicionar = (req, res) => {

    const usuarioId = req.usuario.id;

    const {
        tipo,
        referencia_id,
    } = req.body;

    if (!tipo || !referencia_id) {
        return res.status(400).json({
            mensagem: "Tipo e referência são obrigatórios.",
        });
    }

    verificarExistencia(
    tipo,
    referencia_id,
    (err, existe) => {

        if (err) {
            return res.status(500).json({
                mensagem: "Erro ao validar item."
            });
        }

        if (!existe) {
            return res.status(404).json({
                mensagem: "Item não encontrado."
            });
        }

        favoritoModel.existe(
            usuarioId,
            tipo,
            referencia_id,
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        mensagem: "Erro ao verificar favorito.",
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        mensagem: "Item já está nos favoritos.",
                    });
                }

                favoritoModel.adicionar(
                    usuarioId,
                    tipo,
                    referencia_id,
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                mensagem: "Erro ao adicionar favorito.",
                            });
                        }

                        return res.status(201).json({
                            mensagem: "Favorito adicionado com sucesso.",
                        });

                    }
                );

            }
        );

    }
);

return;

    favoritoModel.existe(
        usuarioId,
        tipo,
        referencia_id,
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    mensagem: "Erro ao verificar favorito.",
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    mensagem: "Item já está nos favoritos.",
                });
            }

            favoritoModel.adicionar(
                usuarioId,
                tipo,
                referencia_id,
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            mensagem: "Erro ao adicionar favorito.",
                        });
                    }

                    return res.status(201).json({
                        mensagem: "Favorito adicionado com sucesso.",
                    });

                }
            );

        }
    );
};

// ===============================
// REMOVER FAVORITO
// ===============================
exports.remover = (req, res) => {

    const usuarioId = req.usuario.id;

    const {
        tipo,
        referencia_id,
    } = req.body;

    if (!tipo || !referencia_id) {
        return res.status(400).json({
            mensagem: "Tipo e referência são obrigatórios.",
        });
    }

    favoritoModel.remover(
        usuarioId,
        tipo,
        referencia_id,
        (err) => {

            if (err) {
                return res.status(500).json({
                    mensagem: "Erro ao remover favorito.",
                });
            }

            return res.json({
                mensagem: "Favorito removido com sucesso.",
            });

        }
    );
};

// ===============================
// LISTAR FAVORITOS
// ===============================
exports.listar = (req, res) => {

    const usuarioId = req.usuario.id;

    favoritoModel.listarIds(usuarioId, (err, favoritos) => {

        if (err) {
            return res.status(500).json({
                mensagem: "Erro ao listar favoritos."
            });
        }

        const produtosIds = favoritos
            .filter(f => f.tipo === "produto")
            .map(f => f.referencia_id);

        const lojasIds = favoritos
            .filter(f => f.tipo === "loja")
            .map(f => f.referencia_id);

        const servicosIds = favoritos
            .filter(f => f.tipo === "servico")
            .map(f => f.referencia_id);

        favoritoModel.listarProdutos(
            produtosIds,
            (err, produtos) => {

                if (err) {
                    return res.status(500).json({
                        mensagem: "Erro ao listar produtos favoritos."
                    });
                }

                favoritoModel.listarLojas(
                    lojasIds,
                    (err, lojas) => {

                        if (err) {
                            return res.status(500).json({
                                mensagem: "Erro ao listar lojas favoritas."
                            });
                        }

                        favoritoModel.listarServicos(
                            servicosIds,
                            (err, servicos) => {

                                if (err) {
                                    return res.status(500).json({
                                        mensagem: "Erro ao listar serviços favoritos."
                                    });
                                }

                                return res.json({
                                    produtos,
                                    lojas,
                                    servicos
                                });

                            }
                        );

                    }
                );

            }
        );

    });

};

// ===============================
// STATUS FAVORITO
// ===============================
exports.status = (req, res) => {

    const usuarioId = req.usuario.id;

    const {
        tipo,
        referencia_id,
    } = req.query;

    if (!tipo || !referencia_id) {
        return res.status(400).json({
            mensagem: "Tipo e referência são obrigatórios.",
        });
    }

    favoritoModel.existe(
        usuarioId,
        tipo,
        referencia_id,
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    mensagem: "Erro ao consultar favorito.",
                });
            }

            return res.json({
                favoritado: results.length > 0,
            });

        }
    );
};
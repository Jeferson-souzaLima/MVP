const buscaModel = require('../models/buscaModel');

// ===============================
// BUSCA GLOBAL
// ===============================
exports.buscar = (req, res) => {

    const { q } = req.query;

    // Validação
    if (!q || !q.trim()) {
        return res.status(400).json({
            mensagem: 'Informe um termo para pesquisa.'
        });
    }

    buscaModel.buscar(q.trim(), (err, resultados) => {

        if (err) {
            return res.status(500).json({
                erro: err
            });
        }

        res.status(200).json(resultados);

    });

};

// ===============================
// BUSCA COMPLETA
// ===============================
exports.buscarResultados = (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({
      mensagem: "Informe um termo para pesquisa.",
    });
  }

  buscaModel.buscarResultados(q.trim(), (err, resultados) => {
    if (err) {
      return res.status(500).json({
        erro: err,
      });
    }

    res.status(200).json(resultados);
  });
};
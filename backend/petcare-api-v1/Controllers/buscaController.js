const buscaModel = require('../Models/buscaModel');

exports.buscar = (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({
            mensagem: 'Informe um termo para pesquisa.'
        });
    }

    const usuario = req.usuario;

    // Lojista não utiliza a busca B2C.
    // A busca específica para lojistas será implementada futuramente.
    if (usuario?.tipo === 'lojista') {
        return res.status(200).json({
            contexto: 'lojista',
            disponivel: false,
            produtos: [],
            lojas: [],
            servicos: []
        });
    }

    buscaModel.buscar(q.trim(), (err, resultados) => {
        if (err) {
            return res.status(500).json({
                erro: err
            });
        }

        res.status(200).json({
            contexto: 'cliente',
            disponivel: true,
            ...resultados
        });
    });
};

exports.buscarResultados = (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({
            mensagem: 'Informe um termo para pesquisa.'
        });
    }

    const usuario = req.usuario;

    // Lojista não utiliza a busca B2C.
    // A busca específica para lojistas será implementada futuramente.
    if (usuario?.tipo === 'lojista') {
        return res.status(200).json({
            contexto: 'lojista',
            disponivel: false,
            produtos: [],
            lojas: [],
            servicos: []
        });
    }

    buscaModel.buscarResultados(q.trim(), (err, resultados) => {
        if (err) {
            return res.status(500).json({
                erro: err
            });
        }

        res.status(200).json({
            contexto: 'cliente',
            disponivel: true,
            ...resultados
        });
    });
};
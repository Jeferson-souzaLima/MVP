// controllers/lojasController.js
const lojaModel = require('../Models/lojasModel');
const db = require('../db');

// Listar todas as lojas
exports.listarLojas = (req, res) => {
    lojaModel.getAll((err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
};

// Criar uma nova loja (sem imagem ainda)
exports.criarLoja = (req, res) => {
    const { nome, endereco } = req.body;
    const query = 'INSERT INTO Lojas (nome, endereco) VALUES (?, ?)';
    db.query(query, [nome, endereco], (err, result) => {
        if (err) return res.status(500).json({ erro: err });

        res.status(201).json({
            mensagem: 'Loja criada com sucesso!',
            lojaId: result.insertId
        });
    });
};

// Upload/atualiza��o da imagem da loja
exports.uploadImagem = (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ mensagem: 'Nenhuma imagem foi enviada.' });
    }

    const imagemUrl = `/uploads/${ req.file.filename }`;
    const query = 'UPDATE Lojas SET imagem = ? WHERE id = ?';

    db.query(query, [imagemUrl, id], (err, result) => {
        if (err) return res.status(500).json({ erro: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Loja n�o encontrada.' });
        }

        res.json({
            mensagem: 'Imagem da loja atualizada com sucesso!',
            imagemUrl
        });
    });
};

// Atualizar dados da loja
exports.atualizarLoja = (req, res) => {
    const { id } = req.params;
    const dados = req.body;

    lojaModel.update(id, dados, (err, result) => {
        if (err) return res.status(500).json({ erro: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Loja n�o encontrada.' });
        }

        res.json({ mensagem: 'Loja atualizada com sucesso!' });
    });
};

// Deletar loja
exports.deletarLoja = (req, res) => {
    const { id } = req.params;

    lojaModel.delete(id, (err, result) => {
        if (err) return res.status(500).json({ erro: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Loja n�o encontrada.' });
        }

        res.json({ mensagem: 'Loja deletada com sucesso!' });
    });
};

// Buscar loja por ID (p�blica)
exports.getLojaPorId = (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM Lojas WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err });

        if (results.length === 0) {
            return res.status(404).json({ mensagem: 'Loja n�o encontrada.' });
        }

        res.json(results[0]);
    });
};
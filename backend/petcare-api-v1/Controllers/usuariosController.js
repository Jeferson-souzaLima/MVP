const db = require('../db'); 
const usuarioModel = require('../models/usuariosModel');

exports.listarUsuarios = (req, res) => {
    usuarioModel.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.criarUsuario = (req, res) => {
    const novoUsuario = req.body;
    usuarioModel.create(novoUsuario, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, ...novoUsuario });
    });
};

exports.deletarUsuario = (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM Usuarios WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar usuário:', err);
            res.status(500).json({ erro: 'Erro ao deletar usuário.' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        } else {
            res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
        }
    });
};

exports.atualizarUsuario = (req, res) => {
    const id = req.params.id;
    const dadosAtualizados = req.body;

    usuarioModel.update(id, dadosAtualizados, (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar usuário.' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!' });
    });
};

exports.atualizarMeuPerfil = (req, res) => {
    const id = req.usuario.id;

    const {
        nome,
        telefone,
        cidade,
        uf
    } = req.body;

    usuarioModel.updatePerfil(
        id,
        {
            nome,
            telefone,
            cidade,
            uf
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    mensagem: "Erro ao atualizar perfil."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });
            }

            return res.json({
                mensagem: "Perfil atualizado com sucesso."
            });
        }
    );
};


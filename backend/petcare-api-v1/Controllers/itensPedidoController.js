const itensPedidoModel = require('../models/itensPedidoModel');
const pedidosModel = require('../models/pedidosModel');

// Fun��o auxiliar de permiss�o
function verificarPermissaoPedido(pedido, usuario) {
    if (usuario.tipo === 'admin') return true;

    if (usuario.tipo === 'cliente') {
        return pedido.usuario_id === usuario.id;
    }

    if (usuario.tipo === 'lojista') {
        return pedido.loja_id === usuario.loja_id;
    }

    return false;
}

exports.listarItensPedido = (req, res) => {
    const { pedidoId } = req.params;
    const usuario = req.usuario;

    pedidosModel.getByIdSimples(pedidoId, (err, pedido) => {
        if (err) return res.status(500).send(err);
        if (!pedido) return res.status(404).json({ mensagem: 'Pedido n�o encontrado.' });

        if (!verificarPermissaoPedido(pedido, usuario)) {
            return res.status(403).json({ mensagem: 'Acesso negado.' });
        }

        itensPedidoModel.getAllByPedidoId(pedidoId, (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });
};

exports.adicionarItemPedido = (req, res) => {
    const usuario = req.usuario;
    const novoItem = req.body;

    pedidosModel.getByIdSimples(novoItem.pedido_id, (err, pedido) => {
        if (err) return res.status(500).send(err);
        if (!pedido) return res.status(404).json({ mensagem: 'Pedido n�o encontrado.' });

        if (!verificarPermissaoPedido(pedido, usuario)) {
            return res.status(403).json({ mensagem: 'Acesso negado.' });
        }

        if (pedido.status !== 'pendente') {
            return res.status(400).json({ mensagem: 'Pedido n�o pode mais ser alterado.' });
        }

        itensPedidoModel.create(novoItem, (err, result) => {
            if (err) return res.status(500).send(err);
            res.status(201).json({ id: result.insertId, ...novoItem });
        });
    });
};

exports.atualizarItemPedido = (req, res) => {
    const { itemId } = req.params;
    const usuario = req.usuario;

    itensPedidoModel.getById(itemId, (err, item) => {
        if (err) return res.status(500).send(err);
        if (!item) return res.status(404).json({ mensagem: 'Item n�o encontrado.' });

        pedidosModel.getByIdSimples(item.pedido_id, (err, pedido) => {
            if (err) return res.status(500).send(err);

            if (!verificarPermissaoPedido(pedido, usuario)) {
                return res.status(403).json({ mensagem: 'Acesso negado.' });
            }

            if (pedido.status !== 'pendente') {
                return res.status(400).json({ mensagem: 'Pedido n�o pode mais ser alterado.' });
            }

            itensPedidoModel.update(itemId, req.body, (err, result) => {
                if (err) return res.status(500).send(err);
                res.json({ mensagem: 'Item atualizado com sucesso.' });
            });
        });
    });
};

exports.deletarItemPedido = (req, res) => {
    const { itemId } = req.params;
    const usuario = req.usuario;

    itensPedidoModel.getById(itemId, (err, item) => {
        if (err) return res.status(500).send(err);
        if (!item) return res.status(404).json({ mensagem: 'Item n�o encontrado.' });

        pedidosModel.getByIdSimples(item.pedido_id, (err, pedido) => {
            if (err) return res.status(500).send(err);

            if (!verificarPermissaoPedido(pedido, usuario)) {
                return res.status(403).json({ mensagem: 'Acesso negado.' });
            }

            if (pedido.status !== 'pendente') {
                return res.status(400).json({ mensagem: 'Pedido n�o pode mais ser alterado.' });
            }

            itensPedidoModel.delete(itemId, (err) => {
                if (err) return res.status(500).send(err);
                res.json({ mensagem: 'Item removido com sucesso.' });
            });
        });
    });
};
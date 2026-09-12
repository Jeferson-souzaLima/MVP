const pedidosModel = require('../Models/pedidosModel');
const db = require('../db');
const { criarPedidoReservado } = require('../Services/pedidoCheckoutService');
const MercadoPagoService = require('../Services/mercadoPagoService');
const PagamentosModel = require('../Models/pagamentosModel');

// ===============================
// ADMIN � ver todos pedidos
// ===============================
exports.getAll = (req, res) => {
    const usuario = req.usuario;

    if (usuario.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso restrito ao administrador.' });
    }

    pedidosModel.getAll((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// ===============================
// CLIENTE � criar pedido
// ===============================
exports.create = (req, res) => {
    const usuario = req.usuario;

    if (usuario.tipo !== 'cliente') {
        return res.status(403).json({ mensagem: 'Somente clientes podem criar pedidos.' });
    }

    const novoPedido = req.body;
    novoPedido.usuario_id = usuario.id;

    pedidosModel.createPedidoComItens(novoPedido, (err, pedidoId) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ mensagem: 'Pedido criado com sucesso!', pedidoId });
    });
};

// ===============================
// CLIENTE � ver apenas seus pedidos
// ===============================
exports.getMeusPedidos = (req, res) => {
    const usuario = req.usuario;

    if (usuario.tipo !== 'cliente') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para clientes.'
        });
    }

    pedidosModel.getMeusPedidosCompletos(usuario.id, (err, resultados) => {
        if (err) {
            console.error('Erro ao buscar meus pedidos:', err);
            return res.status(500).json({
                mensagem: 'Não foi possível carregar seus pedidos.'
            });
        }

        const pedidos = {};

        resultados.forEach(item => {
            if (!pedidos[item.id]) {
                pedidos[item.id] = {
                    id: item.id,
                    loja_id: item.loja_id,
                    nome_loja: item.nome_loja,
                    data_pedido: item.data_pedido,
                    status: item.status,
                    subtotal: Number(item.subtotal),
                    valor_entrega: Number(item.valor_entrega),
                    total: Number(item.total),
                    modalidade_entrega: item.modalidade_entrega,
                    itens: []
                };
            }

            pedidos[item.id].itens.push({
                item_id: item.item_id,
                tipo: item.tipo,
                produto_id: item.produto_id,
                nome_item: item.nome_item,
                preco_unitario: Number(item.preco_unitario),
                quantidade: item.quantidade
            });
        });

        res.json(Object.values(pedidos));
    });
};

// ===============================
// LOJISTA � ver pedidos da sua loja
// ===============================
exports.getPedidosLoja = (req, res) => {
    const usuario = req.usuario;

    if (usuario.tipo !== 'lojista') {
        return res.status(403).json({ mensagem: 'Acesso permitido apenas para lojistas.' });
    }

    if (!usuario.loja_id) {
        return res.status(400).json({ mensagem: 'Loja n�o identificada no token.' });
    }

    const query = 'SELECT * FROM Pedidos WHERE loja_id = ?';
    pedidosModel.getByFilters(query, [usuario.loja_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// ===============================
// LOJISTA � atualizar status
// ===============================
exports.updateStatus = (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ mensagem: 'Status � obrigat�rio.' });
    }

    pedidosModel.getByIdSimples(id, (err, pedido) => {
        if (err) return res.status(500).send(err);
        if (!pedido) {
            return res.status(404).json({ mensagem: 'Pedido n�o encontrado.' });
        }

        // ADMIN pode tudo
        if (usuario.tipo === 'admin') {
            return atualizar();
        }

        // LOJISTA s� altera pedidos da pr�pria loja
        if (usuario.tipo === 'lojista') {
            if (pedido.loja_id !== usuario.loja_id) {
                return res.status(403).json({ mensagem: 'Voc� n�o pode alterar pedidos de outra loja.' });
            }
            return atualizar();
        }

        // Cliente nunca altera status
        return res.status(403).json({ mensagem: 'Apenas lojistas podem alterar o status.' });

        function atualizar() {

            // ?? Prote��o opcional: impedir altera��o se j� finalizado
            if (pedido.status === 'cancelado' || pedido.status === 'entregue') {
                return res.status(400).json({ mensagem: 'Pedido j� finalizado e n�o pode ser alterado.' });
            }
            const transicoes = {
                pago: ['em_preparo'],
                em_preparo: ['pronto_para_retirada', 'em_entrega'],
                pronto_para_retirada: ['entregue'],
                em_entrega: ['entregue']
            };
            if (usuario.tipo === 'lojista' && !transicoes[pedido.status]?.includes(status)) {
                return res.status(400).json({ mensagem: 'Transi��o de status inv�lida para este pedido.' });
            }

            pedidosModel.updateStatus(id, status, (err, result) => {
                if (err) return res.status(500).send(err);

                res.json({ mensagem: 'Status atualizado com sucesso!' });
            });
        }
    });
};

// ===============================
// LOJISTA � relat�rio da pr�pria loja
// ===============================
exports.relatorioPedidos = (req, res) => {
    const usuario = req.usuario;

    if (usuario.tipo !== 'lojista') {
        return res.status(403).json({ mensagem: 'Acesso permitido apenas para lojistas.' });
    }

    const { status, data_inicial, data_final } = req.query;

    let query = 'SELECT * FROM Pedidos WHERE loja_id = ?';
    let values = [usuario.loja_id];

    if (status) {
        query += ' AND status = ?';
        values.push(status);
    }

    if (data_inicial && data_final) {
        query += ' AND data_pedido BETWEEN ? AND ?';
        values.push(data_inicial, data_final);
    }

    pedidosModel.getByFilters(query, values, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// ===============================
// ADMIN � deletar pedido
// ===============================
exports.deletarPedido = (req, res) => {
    const usuario = req.usuario;
    const { id } = req.params;

    if (usuario.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Apenas admin pode deletar pedidos.' });
    }

    pedidosModel.delete(id, (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Pedido n�o encontrado.' });
        }

        res.json({ mensagem: 'Pedido deletado com sucesso!' });
    });
};

exports.cancelarPeloCliente = (req, res) => {
    const pedidoId = Number(req.params.id);
    pedidosModel.getByIdSimples(pedidoId, (erro, pedido) => {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao buscar pedido.' });
        if (!pedido || pedido.usuario_id !== req.usuario.id) return res.status(404).json({ mensagem: 'Pedido n�o encontrado.' });
        if (!['aguardando_pagamento', 'pago'].includes(pedido.status)) return res.status(400).json({ mensagem: 'Este pedido j� est� em prepara��o ou entrega e n�o pode ser cancelado pelo cliente.' });
        if (pedido.status === 'aguardando_pagamento') {
            return pedidosModel.cancelarReserva(pedidoId, (cancelErr) => {
                if (cancelErr) return res.status(500).json({ mensagem: 'Erro ao cancelar pedido.' });
                return res.json({ mensagem: 'Pedido cancelado e estoque liberado.' });
            });
        }
        db.query("UPDATE Pedidos SET status = 'cancelado', cancelado_em = NOW() WHERE id = ?", [pedidoId], (updateErr) => {
            if (updateErr) return res.status(500).json({ mensagem: 'Erro ao cancelar pedido.' });
            db.query("INSERT INTO historico_status (tipo, referencia_id, status) VALUES ('pedido', ?, 'cancelado')", [pedidoId], (histErr) => {
                if (histErr) return res.status(500).json({ mensagem: 'Pedido cancelado, mas o hist�rico n�o p�de ser registrado.' });
                return res.json({ mensagem: 'Pedido cancelado. Caso o pagamento tenha sido aprovado, o reembolso ser� tratado manualmente.' });
            });
        });
    });
};

exports.checkout = async (req, res) => {
    try {
        const pedido = await criarPedidoReservado({ usuarioId: req.usuario.id, dados: req.body });
        const preference = await MercadoPagoService.criarPreferencia({
            titulo: `Pedido PetCare Connect #${pedido.pedidoId}`,
            valor: pedido.total,
            referencia_id: pedido.pedidoId,
            referencia_externa: `pedido:${pedido.pedidoId}`,
            itens: pedido.itens.map(item => ({ id: String(item.id), title: item.nome, quantity: item.quantidade, currency_id: 'BRL', unit_price: item.preco }))
        });
        PagamentosModel.create({ tipo_referencia: 'pedido', referencia_id: pedido.pedidoId, gateway: 'mercado_pago', gateway_preference_id: preference.id, status: 'pendente', valor: pedido.total }, (erro, resultado) => {
            if (erro) return res.status(500).json({ mensagem: 'Pedido reservado, mas n�o foi poss�vel registrar o pagamento.' });
            return res.status(201).json({ pedido_id: pedido.pedidoId, pagamento_id: resultado.insertId, total: pedido.total, valor_entrega: pedido.frete, checkout_url: preference.init_point, expira_em_minutos: 10 });
        });
    } catch (erro) {
        console.error('Erro ao iniciar checkout:', erro);
        return res.status(erro.status || 500).json({ mensagem: erro.message || 'N�o foi poss�vel iniciar o checkout.' });
    }
};

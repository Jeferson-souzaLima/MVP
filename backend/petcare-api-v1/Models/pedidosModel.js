const db = require('../db');
const historicoStatusModel = require('./historicoStatusModel');

// Buscar todos os pedidos
exports.getAll = (callback) => {
    db.query('SELECT * FROM Pedidos', callback);
};

// Criar um novo pedido com itens
exports.createPedidoComItens = (
    { usuario_id, loja_id, total, itens },
    callback
) => {
    const query = `
        INSERT INTO Pedidos (usuario_id, loja_id, total, status)
        VALUES (?, ?, ?, 'aguardando_pagamento')
    `;

    const values = [usuario_id, loja_id, total];

    if (!Array.isArray(itens) || itens.length === 0) {
        return callback(new Error('O pedido deve possuir pelo menos um item.'));
    }

    db.beginTransaction((err) => {
        if (err) {
            return callback(err);
        }

        // 1. Criar pedido
        db.query(query, values, (err, result) => {
            if (err) {
                return db.rollback(() => callback(err));
            }

            const pedidoId = result.insertId;

            // 2. Preparar itens
            const itensQuery = `
                INSERT INTO ItensPedido
                (pedido_id, tipo, item_id, nome_item, preco_unitario, quantidade)
                VALUES ?
            `;

            const itensValues = itens.map(item => [
                pedidoId,
                item.tipo,
                item.item_id,
                item.nome_item,
                item.preco_unitario,
                item.quantidade
            ]);

            // 3. Inserir itens
            db.query(itensQuery, [itensValues], (err) => {
                if (err) {
                    return db.rollback(() => callback(err));
                }

                // 4. Registrar histórico inicial
                historicoStatusModel.registrarStatus(
                    {
                        tipo: 'pedido',
                        referencia_id: pedidoId,
                        status: 'pendente'
                    },
                    (err) => {
                        if (err) {
                            return db.rollback(() => callback(err));
                        }

                        // 5. Confirmar toda a transação
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => callback(err));
                            }

                            callback(null, pedidoId);
                        });
                    }
                );
            });
        });
    });
};

// Atualizar o status do pedido
exports.updateStatus = (id, status, callback) => {
    const query = `
        UPDATE Pedidos
        SET status = ?
        WHERE id = ?
    `;

    db.query(query, [status, id], (err, result) => {
        if (err) {
            return callback(err);
        }

        if (result.affectedRows === 0) {
            return callback(new Error('Pedido não encontrado.'));
        }

        historicoStatusModel.registrarStatus(
            {
                tipo: 'pedido',
                referencia_id: id,
                status
            },
            (err) => {
                if (err) {
                    return callback(err);
                }

                callback(null, result);
            }
        );
    });
};

// Deletar um pedido
exports.delete = (id, callback) => {
    const query = `
        DELETE FROM Pedidos
        WHERE id = ?
    `;

    db.query(query, [id], callback);
};

// Buscar pedidos com base em filtros
exports.getByFilters = (query, values, callback) => {
    db.query(query, values, callback);
};

// Verificar se já existe pedido pendente de usuário para a loja
exports.getCarrinhoPendente = (usuario_id, loja_id, callback) => {
    const query = `
        SELECT *
        FROM Pedidos
        WHERE usuario_id = ?
          AND loja_id = ?
          AND status = 'pendente'
        LIMIT 1
    `;

    db.query(query, [usuario_id, loja_id], callback);
};

// Ver carrinho atual
exports.getCarrinhoCompleto = (pedido_id, callback) => {
    const query = `
        SELECT
            p.*,
            i.*
        FROM Pedidos p
        JOIN ItensPedido i ON i.pedido_id = p.id
        WHERE p.id = ?
    `;

    db.query(query, [pedido_id], callback);
};

exports.getByIdSimples = (id, callback) => {
    const sql = `
        SELECT
            id,
            usuario_id,
            loja_id,
            total,
            status
        FROM Pedidos
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);

        callback(null, results[0]);
    });
};

exports.confirmarPagamento = (id, callback) => {
    db.query("UPDATE Pedidos SET status = 'pago', reserva_expira_em = NULL WHERE id = ? AND status = 'aguardando_pagamento' AND reserva_expira_em >= NOW()", [id], callback);
};

exports.cancelarReservasExpiradas = (callback) => {
    db.query("SELECT id FROM Pedidos WHERE status = 'aguardando_pagamento' AND reserva_expira_em < NOW()", (erro, pedidos) => {
        if (erro) return callback(erro);
        let pendentes = pedidos.length;
        if (!pendentes) return callback(null, 0);
        let concluidos = 0;
        pedidos.forEach(pedido => exports.cancelarReservaExpirada(pedido.id, (err, cancelado) => {
            if (!err && cancelado) concluidos++;
            if (--pendentes === 0) callback(null, concluidos);
        }));
    });
};

exports.cancelarReservaExpirada = (id, callback) => {
    db.beginTransaction((erro) => {
        if (erro) return callback(erro);
        db.query("SELECT id FROM Pedidos WHERE id = ? AND status = 'aguardando_pagamento' AND reserva_expira_em < NOW() FOR UPDATE", [id], (err, pedidos) => {
            if (err || !pedidos.length) return db.rollback(() => callback(err, false));
            db.query('SELECT item_id, quantidade FROM ItensPedido WHERE pedido_id = ? AND tipo = \'produto\'', [id], (itensErr, itens) => {
                if (itensErr) return db.rollback(() => callback(itensErr));
                const devolver = itens.reduce((promessa, item) => promessa.then(() => new Promise((resolve, reject) => db.query('UPDATE Produtos SET estoque = estoque + ? WHERE id = ?', [item.quantidade, item.item_id], erroAtualizacao => erroAtualizacao ? reject(erroAtualizacao) : resolve()))), Promise.resolve());
                devolver.then(() => {
                    db.query("UPDATE Pedidos SET status = 'cancelado', cancelado_em = NOW() WHERE id = ?", [id], updateErr => {
                        if (updateErr) return db.rollback(() => callback(updateErr));
                        db.query("INSERT INTO historico_status (tipo, referencia_id, status) VALUES ('pedido', ?, 'cancelado')", [id], historicoErr => {
                            if (historicoErr) return db.rollback(() => callback(historicoErr));
                            db.commit(commitErr => commitErr ? db.rollback(() => callback(commitErr)) : callback(null, true));
                        });
                    });
                }).catch(falha => db.rollback(() => callback(falha)));
            });
        });
    });
};

exports.cancelarReserva = (id, callback) => {
    db.beginTransaction((erro) => {
        if (erro) return callback(erro);
        db.query("SELECT id FROM Pedidos WHERE id = ? AND status = 'aguardando_pagamento' FOR UPDATE", [id], (err, pedidos) => {
            if (err || !pedidos.length) return db.rollback(() => callback(err, false));
            db.query("SELECT item_id, quantidade FROM ItensPedido WHERE pedido_id = ? AND tipo = 'produto'", [id], (itensErr, itens) => {
                if (itensErr) return db.rollback(() => callback(itensErr));
                const devolver = itens.reduce((promessa, item) => promessa.then(() => new Promise((resolve, reject) => db.query('UPDATE Produtos SET estoque = estoque + ? WHERE id = ?', [item.quantidade, item.item_id], atualizacaoErr => atualizacaoErr ? reject(atualizacaoErr) : resolve()))), Promise.resolve());
                devolver.then(() => {
                    db.query("UPDATE Pedidos SET status = 'cancelado', cancelado_em = NOW() WHERE id = ?", [id], updateErr => {
                        if (updateErr) return db.rollback(() => callback(updateErr));
                        db.query("INSERT INTO historico_status (tipo, referencia_id, status) VALUES ('pedido', ?, 'cancelado')", [id], historicoErr => {
                            if (historicoErr) return db.rollback(() => callback(historicoErr));
                            db.commit(commitErr => commitErr ? db.rollback(() => callback(commitErr)) : callback(null, true));
                        });
                    });
                }).catch(falha => db.rollback(() => callback(falha)));
            });
        });
    });
};

exports.getMeusPedidosCompletos = (usuario_id, callback) => {
    const query = `
        SELECT
            p.id,
            p.loja_id,
            l.nome_fantasia AS nome_loja,
            p.data_pedido,
            p.status,
            p.subtotal,
            p.valor_entrega,
            p.total,
            p.modalidade_entrega,
            i.id AS item_id,
            i.tipo,
            i.item_id AS produto_id,
            i.nome_item,
            i.preco_unitario,
            i.quantidade
        FROM Pedidos p
        INNER JOIN Lojas l
            ON l.id = p.loja_id
        INNER JOIN ItensPedido i
            ON i.pedido_id = p.id
        WHERE p.usuario_id = ?
        ORDER BY p.data_pedido DESC, p.id DESC
    `;

    db.query(query, [usuario_id], callback);
};
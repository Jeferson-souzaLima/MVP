const db = require('../db');

exports.getAllByPedidoId = (pedidoId, callback) => {
    db.query('SELECT * FROM itenspedido WHERE pedido_id = ?', [pedidoId], callback);
};

exports.create = (item, callback) => {
    const { pedido_id, tipo, item_id, nome_item, preco_unitario, quantidade } = item;
    const query = `
        INSERT INTO itenspedido (pedido_id, tipo, item_id, nome_item, preco_unitario, quantidade)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [pedido_id, tipo, item_id, nome_item, preco_unitario, quantidade];
    db.query(query, values, callback);
};

exports.update = (itemId, dados, callback) => {
    const { tipo, item_id, nome_item, preco_unitario, quantidade } = dados;
    const sql = `
        UPDATE itenspedido SET tipo = ?, item_id = ?, nome_item = ?, preco_unitario = ?, quantidade = ?
        WHERE id = ?
    `;
    db.query(sql, [tipo, item_id, nome_item, preco_unitario, quantidade, itemId], callback);
};

exports.delete = (itemId, callback) => {
    db.query('DELETE FROM itenspedido WHERE id = ?', [itemId], callback);
};

exports.getById = (id, callback) => {
    const sql = 'SELECT * FROM itenspedido WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
};
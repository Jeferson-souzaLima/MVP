const db = require('../db');

//
// ===============================
// REGISTRAR STATUS
// ===============================
exports.registrarStatus = (
    { pedido_id, tipo, referencia_id, status },
    callback
) => {
    const query = `
        INSERT INTO historico_pedido_status
        (pedido_id, tipo, referencia_id, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        query,
        [pedido_id, tipo, referencia_id, status],
        callback
    );
};

//
// ===============================
// HISTÓRICO DO PEDIDO
// ===============================
exports.getHistoricoPorPedido = (pedido_id, callback) => {
    const query = `
        SELECT
            id,
            pedido_id,
            tipo,
            referencia_id,
            status,
            data_status
        FROM historico_pedido_status
        WHERE pedido_id = ?
        ORDER BY data_status ASC, id ASC
    `;

    db.query(query, [pedido_id], callback);
};

//
// ===============================
// HISTÓRICO POR REFERÊNCIA
// ===============================
exports.getHistoricoPorReferencia = (
    referencia_id,
    tipo,
    callback
) => {
    const query = `
        SELECT
            id,
            pedido_id,
            tipo,
            referencia_id,
            status,
            data_status
        FROM historico_pedido_status
        WHERE referencia_id = ?
          AND tipo = ?
        ORDER BY data_status ASC, id ASC
    `;

    db.query(
        query,
        [referencia_id, tipo],
        callback
    );
};
const db = require('../db');

exports.registrarStatus = (
    { tipo, referencia_id, status },
    callback
) => {
    const query = `
        INSERT INTO historico_status
        (tipo, referencia_id, status)
        VALUES (?, ?, ?)
    `;

    db.query(
        query,
        [tipo, referencia_id, status],
        callback
    );
};

exports.getHistorico = (
    tipo,
    referencia_id,
    callback
) => {
    const query = `
        SELECT
            id,
            tipo,
            referencia_id,
            status,
            data_status
        FROM historico_status
        WHERE tipo = ?
          AND referencia_id = ?
        ORDER BY data_status ASC, id ASC
    `;

    db.query(
        query,
        [tipo, referencia_id],
        callback
    );
};
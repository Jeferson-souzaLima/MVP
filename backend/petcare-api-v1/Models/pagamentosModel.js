const db = require('../db');

const PagamentosModel = {

    create: (dados, callback) => {

        const sql = `
            INSERT INTO pagamentos (
                tipo_referencia,
                referencia_id,
                gateway,
                gateway_preference_id,
                gateway_payment_id,
                status,
                valor
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            dados.tipo_referencia,
            dados.referencia_id,
            dados.gateway,
            dados.gateway_preference_id || null,
            dados.gateway_payment_id || null,
            dados.status || 'pendente',
            dados.valor
        ], callback);
    },

    getById: (id, callback) => {

        const sql = `
            SELECT *
            FROM pagamentos
            WHERE id = ?
        `;

        db.query(sql, [id], (err, results) => {

            if (err) return callback(err);

            callback(null, results[0] || null);

        });
    },

    getByReferencia: (tipo_referencia, referencia_id, callback) => {

        const sql = `
            SELECT *
            FROM pagamentos
            WHERE tipo_referencia = ?
            AND referencia_id = ?
            ORDER BY id DESC
        `;

        db.query(
            sql,
            [tipo_referencia, referencia_id],
            callback
        );
    },

    getByGatewayPaymentId: (gateway_payment_id, callback) => {

        const sql = `
            SELECT *
            FROM pagamentos
            WHERE gateway_payment_id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [gateway_payment_id],
            (err, results) => {

                if (err) return callback(err);

                callback(null, results[0] || null);

            }
        );
    },

    updateStatus: (id, status, callback) => {

        const sql = `
            UPDATE pagamentos
            SET status = ?
            WHERE id = ?
        `;

        db.query(sql, [status, id], callback);
    },

    updateGatewayPaymentId: (
        id,
        gateway_payment_id,
        callback
    ) => {

        const sql = `
            UPDATE pagamentos
            SET gateway_payment_id = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [gateway_payment_id, id],
            callback
        );
    }

};

module.exports = PagamentosModel;

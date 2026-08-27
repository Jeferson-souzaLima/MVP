const db = require('../db');

const AgendaConfig = {

    getByLojaId: (loja_id, callback) => {
        const sql = `
            SELECT * 
            FROM agenda_config 
            WHERE loja_id = ?
            LIMIT 1
        `;

        db.query(sql, [loja_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    getByLojaIdPromise: (loja_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
            SELECT *
            FROM agenda_config
            WHERE loja_id = ?
            LIMIT 1
        `;

            db.query(sql, [loja_id], (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(results[0] || null);

            });

        });

    },

    create: (data, callback) => {
        const sql = `
            INSERT INTO agenda_config 
            (loja_id, capacidade_por_horario, dias_limite_agendamento, intervalo_minutos, trabalha_24h)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            data.loja_id,
            data.capacidade_por_horario,
            data.dias_limite_agendamento,
            data.intervalo_minutos,
            data.trabalha_24h
        ], callback);
    },

    update: (loja_id, data, callback) => {
        const sql = `
            UPDATE agenda_config
            SET capacidade_por_horario = ?,
                dias_limite_agendamento = ?,
                intervalo_minutos = ?,
                trabalha_24h = ?
            WHERE loja_id = ?
        `;

        db.query(sql, [
            data.capacidade_por_horario,
            data.dias_limite_agendamento,
            data.intervalo_minutos,
            data.trabalha_24h,
            loja_id
        ], callback);
    }

};

module.exports = AgendaConfig;
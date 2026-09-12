const db = require('../db');

const Agendamentos = {

    create: (dados, callback) => {
        const query = `
            INSERT INTO agendamentos
            (
                loja_id,
                servico_id,
                cliente_id,
                cliente_nome_externo,
                cliente_telefone_externo,
                pet_nome,
                data_inicio,
                data_fim,
                status,
                criado_por,
                observacoes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [
            dados.loja_id,
            dados.servico_id,
            dados.cliente_id,
            dados.cliente_nome_externo || null,
            dados.cliente_telefone_externo || null,
            dados.pet_nome || null,
            dados.data_inicio,
            dados.data_fim,
            dados.status,
            dados.criado_por,
            dados.observacoes || null
        ], callback);
    },

    // Conta quantos agendamentos existem no intervalo
    contarNoIntervalo: (loja_id, data_inicio, data_fim, callback) => {
        const query = `
            SELECT COUNT(*) AS total
            FROM agendamentos
            WHERE loja_id = ?
            AND status IN ('aguardando_pagamento', 'confirmado')
            AND (
                data_inicio < ?
                AND data_fim > ?
            )
        `;

        db.query(query, [
            loja_id,
            data_fim,
            data_inicio
        ], callback);
    },

    getByDataPromise: (loja_id, data) => {

        return new Promise((resolve, reject) => {

            const sql = `
            SELECT *
            FROM agendamentos
            WHERE loja_id = ?
            AND DATE(data_inicio) = ?
            AND status IN ('aguardando_pagamento', 'confirmado')
        `;

            db.query(sql, [loja_id, data], (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(results);

            });

        });

    },

    getByIdParaPagamento: (agendamento_id, callback) => {

        const sql = `
            SELECT
                a.id,
                a.cliente_id,
                a.servico_id,
                a.status,
                s.preco AS valor
            FROM agendamentos a
            INNER JOIN servicos s
                ON a.servico_id = s.id
            WHERE a.id = ?
            LIMIT 1
        `;

        db.query(sql, [agendamento_id], (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(null, results[0] || null);
        });
    },
        
    atualizarStatus: (id, status, callback) => {

        const sql = `
            UPDATE agendamentos
            SET status = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [status, id],
            callback
        );
    },

    getDatasComAgendamentosConfirmados: (loja_id, dataInicial, dataFinal, callback) => {
        const query = `
            SELECT DISTINCT DATE(data_inicio) AS data
            FROM agendamentos
            WHERE loja_id = ?
            AND status = 'confirmado'
            AND data_inicio >= ?
            AND data_inicio < ?
            ORDER BY data_inicio ASC
        `;

        db.query(
            query,
            [loja_id, dataInicial, dataFinal],
            callback
        );
    },

};

module.exports = Agendamentos;
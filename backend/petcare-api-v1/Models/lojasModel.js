const db = require('../db');

exports.getAll = (callback) => {
    db.query('SELECT * FROM lojas', callback);
};

exports.getPaginados = (page, limit, callback) => {

    const offset = (page - 1) * limit;

    const queryTotal = `
        SELECT COUNT(*) AS total
        FROM lojas
        WHERE ativo = 1
    `;

    db.query(queryTotal, (err, totalResults) => {

        if (err) {
            return callback(err);
        }

        const total = Number(totalResults[0].total);

        const queryLojas = `
            SELECT *
            FROM lojas
            WHERE ativo = 1
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `;

        db.query(
            queryLojas,
            [limit, offset],
            (err, results) => {

                if (err) {
                    return callback(err);
                }

                const temMais =
                    offset + results.length < total;

                callback(null, {
                    dados: results,
                    pagina: page,
                    limite: limit,
                    total,
                    temMais
                });
            }
        );
    });
};

exports.create = (loja, callback) => {
    const { usuario_id, nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem } = loja;
    const query = `
        INSERT INTO lojas (usuario_id, nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [usuario_id, nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem];
    db.query(query, values, callback);
};

exports.update = (id, dados, callback) => {
    const { nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem } = dados;
    const sql = `
        UPDATE lojas
        SET nome_fantasia = ?, cnpj = ?, descricao = ?, cidade = ?, uf = ?, endereco = ?, ativo = ?, imagem = ?
        WHERE id = ?
    `;
    db.query(sql, [nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem, id], callback);
};

exports.delete = (id, callback) => {
    db.query('DELETE FROM lojas WHERE id = ?', [id], callback);
};

//
// ===============================
// VERIFICAR SE EXISTE POR ID
// ===============================
exports.existePorId = (id, callback) => {
    const sql = `
        SELECT id
        FROM lojas
        WHERE id = ?
        LIMIT 1
    `;
    db.query(sql, [id], callback);
};

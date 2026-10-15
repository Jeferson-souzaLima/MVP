const db = require("../db");

// ===============================
// ADICIONAR FAVORITO
// ===============================
exports.adicionar = (
    usuarioId,
    tipo,
    referenciaId,
    callback
) => {

    const sql = `
        INSERT INTO favoritos (
            usuario_id,
            tipo,
            referencia_id
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            usuarioId,
            tipo,
            referenciaId
        ],
        callback
    );
};

// ===============================
// REMOVER FAVORITO
// ===============================
exports.remover = (
    usuarioId,
    tipo,
    referenciaId,
    callback
) => {

    const sql = `
        DELETE FROM favoritos
        WHERE
            usuario_id = ?
            AND tipo = ?
            AND referencia_id = ?
    `;

    db.query(
        sql,
        [
            usuarioId,
            tipo,
            referenciaId
        ],
        callback
    );
};

// ===============================
// LISTAR FAVORITOS
// ===============================
exports.listarIds = (
    usuarioId,
    callback
) => {

    const sql = `
        SELECT
            id,
            tipo,
            referencia_id,
            data_criacao
        FROM favoritos
        WHERE usuario_id = ?
        ORDER BY data_criacao DESC
    `;

    db.query(
        sql,
        [usuarioId],
        callback
    );
};

// ===============================
// LISTAR PRODUTOS FAVORITOS
// ===============================
exports.listarProdutos = (ids, callback) => {

    if (ids.length === 0) {
        return callback(null, []);
    }

    const placeholders = ids.map(() => "?").join(",");

    const sql = `
        SELECT
            p.id,
            p.nome,
            p.preco,

            l.id AS loja_id,
            l.nome_fantasia AS loja_nome,
            l.imagem AS loja_logo,

            pi.caminho AS imagem

        FROM produtos p

        JOIN lojas l
            ON l.id = p.loja_id

        LEFT JOIN produtoimagens pi
            ON pi.produto_id = p.id
           AND pi.principal = 1

        WHERE
            p.ativo = 1
            AND p.id IN (${placeholders})

        ORDER BY FIELD(p.id, ${placeholders})
    `;

    db.query(
        sql,
        [
            ...ids,
            ...ids
        ],
        (err, results) => {

            if (err) return callback(err);

            const produtos = results.map((produto) => ({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,

                imagens: produto.imagem
                    ? [{
                        caminho: produto.imagem
                    }]
                    : [],

                loja: {
                    id: produto.loja_id,
                    nome: produto.loja_nome,
                    logo: produto.loja_logo
                }
            }));

            callback(null, produtos);

        }
    );
};

// ===============================
// LISTAR LOJAS FAVORITAS
// ===============================
exports.listarLojas = (ids, callback) => {

    if (ids.length === 0) {
        return callback(null, []);
    }

    const placeholders = ids.map(() => "?").join(",");

    const sql = `
        SELECT
            id,
            nome_fantasia,
            imagem

        FROM lojas

        WHERE id IN (${placeholders})

        ORDER BY FIELD(id, ${placeholders})
    `;

    db.query(
        sql,
        [
            ...ids,
            ...ids
        ],
        callback
    );
};

// ===============================
// LISTAR SERVIÇOS FAVORITOS
// ===============================
exports.listarServicos = (ids, callback) => {

    if (ids.length === 0) {
        return callback(null, []);
    }

    const placeholders = ids.map(() => "?").join(",");

    const sql = `
        SELECT

            s.id,
            s.nome,
            s.preco,
            s.duracao_min,

            l.id AS loja_id,
            l.nome_fantasia AS loja_nome,
            l.imagem AS loja_logo

        FROM servicos s

        JOIN lojas l
            ON l.id = s.loja_id

        WHERE
            s.ativo = 1
            AND s.id IN (${placeholders})

        ORDER BY FIELD(s.id, ${placeholders})
    `;

    db.query(
        sql,
        [
            ...ids,
            ...ids
        ],
        callback
    );
};

// ===============================
// VERIFICAR FAVORITO
// ===============================
exports.existe = (
    usuarioId,
    tipo,
    referenciaId,
    callback
) => {

    const sql = `
        SELECT id
        FROM favoritos
        WHERE
            usuario_id = ?
            AND tipo = ?
            AND referencia_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [
            usuarioId,
            tipo,
            referenciaId
        ],
        callback
    );
};
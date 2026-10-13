const db = require("../db");

const {
    RAIO_PADRAO_KM,
    LIMITE_RESULTADOS
} = require("../Config/geolocalizacaoConfig");

exports.buscarLojas = (
    latitude,
    longitude,
    page = 1,
    limit = LIMITE_RESULTADOS,
    callback
) => {

    const offset = (page - 1) * limit;

    // ===============================
    // CONTAR LOJAS DENTRO DO RAIO
    // ===============================
    const queryTotal = `

        SELECT COUNT(*) AS total

        FROM Lojas

        WHERE

            ativo = 1

            AND latitude IS NOT NULL

            AND longitude IS NOT NULL

            AND (
                6371 *
                ACOS(

                    COS(RADIANS(?))
                    *
                    COS(RADIANS(latitude))
                    *
                    COS(
                        RADIANS(longitude)
                        - RADIANS(?)
                    )
                    +
                    SIN(RADIANS(?))
                    *
                    SIN(RADIANS(latitude))

                )
            ) <= ?

    `;

    db.query(

        queryTotal,

        [
            latitude,
            longitude,
            latitude,
            RAIO_PADRAO_KM
        ],

        (erro, totalResults) => {

            if (erro) {
                return callback(erro);
            }

            const total = Number(totalResults[0].total);

            // ===============================
            // BUSCAR LOJAS DA PÁGINA
            // ===============================
            const sql = `

                SELECT

                    id,
                    nome_fantasia,
                    cidade,
                    uf,
                    endereco,
                    imagem,
                    latitude,
                    longitude,

                    (
                        6371 *
                        ACOS(

                            COS(RADIANS(?))
                            *
                            COS(RADIANS(latitude))
                            *
                            COS(
                                RADIANS(longitude)
                                - RADIANS(?)
                            )
                            +
                            SIN(RADIANS(?))
                            *
                            SIN(RADIANS(latitude))

                        )
                    ) AS distancia

                FROM Lojas

                WHERE

                    ativo = 1

                    AND latitude IS NOT NULL

                    AND longitude IS NOT NULL

                HAVING distancia <= ?

                ORDER BY

                    distancia ASC,

                    id DESC

                LIMIT ? OFFSET ?

            `;

            db.query(

                sql,

                [
                    latitude,
                    longitude,
                    latitude,
                    RAIO_PADRAO_KM,
                    limit,
                    offset
                ],

                (erro, resultados) => {

                    if (erro) {
                        return callback(erro);
                    }

                    const temMais =
                        offset + resultados.length < total;

                    callback(null, {

                        dados: resultados,

                        pagina: page,

                        limite: limit,

                        total,

                        temMais

                    });

                }

            );

        }

    );

};

exports.buscarProdutos = (
    latitude,
    longitude,
    page = 1,
    limit = LIMITE_RESULTADOS,
    callback
) => {

    const offset = (page - 1) * limit;

    // ===============================
    // CONTAR PRODUTOS DISPONÍVEIS
    // ===============================
    const queryTotal = `

        SELECT COUNT(*) AS total

        FROM Produtos p

        INNER JOIN Lojas l
            ON l.id = p.loja_id

        WHERE

            p.ativo = 1

            AND l.ativo = 1

            AND l.latitude IS NOT NULL

            AND l.longitude IS NOT NULL

            AND (
                6371 *
                ACOS(

                    COS(RADIANS(?))
                    *
                    COS(RADIANS(l.latitude))
                    *
                    COS(
                        RADIANS(l.longitude)
                        - RADIANS(?)
                    )
                    +
                    SIN(RADIANS(?))
                    *
                    SIN(RADIANS(l.latitude))

                )
            ) <= ?

    `;

    db.query(

        queryTotal,

        [
            latitude,
            longitude,
            latitude,
            RAIO_PADRAO_KM
        ],

        (erro, totalResults) => {

            if (erro) {
                return callback(erro);
            }

            const total = Number(totalResults[0].total);

            // ===============================
            // BUSCAR PRODUTOS DISTRIBUÍDOS
            // ENTRE AS LOJAS
            // ===============================
            const sql = `

                SELECT

                    produtos_selecionados.produto_id,
                    produtos_selecionados.produto_nome,
                    produtos_selecionados.descricao,
                    produtos_selecionados.preco,
                    produtos_selecionados.estoque,
                    produtos_selecionados.ativo,

                    produtos_selecionados.loja_id,
                    produtos_selecionados.loja_nome,
                    produtos_selecionados.loja_logo,

                    produtos_selecionados.distancia,

                    pi.id AS imagem_id,
                    pi.caminho AS imagem_caminho,
                    pi.principal AS imagem_principal

                FROM (

                    SELECT

                        p.id AS produto_id,
                        p.nome AS produto_nome,
                        p.descricao,
                        p.preco,
                        p.estoque,
                        p.ativo,

                        l.id AS loja_id,
                        l.nome_fantasia AS loja_nome,
                        l.imagem AS loja_logo,

                        (
                            6371 *
                            ACOS(

                                COS(RADIANS(?))
                                *
                                COS(RADIANS(l.latitude))
                                *
                                COS(
                                    RADIANS(l.longitude)
                                    - RADIANS(?)
                                )
                                +
                                SIN(RADIANS(?))
                                *
                                SIN(RADIANS(l.latitude))

                            )
                        ) AS distancia,

                        ROW_NUMBER() OVER (

                            PARTITION BY l.id

                            ORDER BY p.id DESC

                        ) AS ordem_na_loja

                    FROM Produtos p

                    INNER JOIN Lojas l
                        ON l.id = p.loja_id

                    WHERE

                        p.ativo = 1

                        AND l.ativo = 1

                        AND l.latitude IS NOT NULL

                        AND l.longitude IS NOT NULL

                ) AS produtos_selecionados

                LEFT JOIN ProdutoImagens pi
                    ON pi.produto_id =
                       produtos_selecionados.produto_id

                WHERE

                    produtos_selecionados.distancia <= ?

                ORDER BY

                    produtos_selecionados.ordem_na_loja ASC,

                    produtos_selecionados.distancia ASC,

                    produtos_selecionados.loja_id ASC,

                    produtos_selecionados.produto_id DESC

                LIMIT ? OFFSET ?

            `;

            db.query(

                sql,

                [
                    latitude,
                    longitude,
                    latitude,
                    RAIO_PADRAO_KM,
                    limit,
                    offset
                ],

                (erro, resultados) => {

                    if (erro) {
                        return callback(erro);
                    }

                    const produtos =
                        agruparProdutos(resultados);

                    const temMais =
                        offset + produtos.length < total;

                    callback(null, {

                        dados: produtos,

                        pagina: page,

                        limite: limit,

                        total,

                        temMais

                    });

                }

            );

        }

    );

};

exports.buscarServicos = (
    latitude,
    longitude,
    page = 1,
    limit = LIMITE_RESULTADOS,
    callback
) => {

    const offset = (page - 1) * limit;

    const distanciaSql = `
        (6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(l.latitude)) *
            COS(RADIANS(l.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(l.latitude))
        ))
    `;

    const whereSql = `
        FROM Servicos s
        INNER JOIN Lojas l ON l.id = s.loja_id
        WHERE s.ativo = 1 AND l.ativo = 1
            AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
        HAVING distancia <= ?
    `;

    const countSql = `
        SELECT COUNT(*) AS total
        FROM (
            SELECT s.id, ${distanciaSql} AS distancia
            ${whereSql}
        ) AS servicos_proximos
    `;

    db.query(countSql, [latitude, longitude, latitude, RAIO_PADRAO_KM], (err, totalResults) => {
        if (err) return callback(err);

        const total = Number(totalResults[0].total);

    const sql = `

        SELECT

            s.id,
            s.loja_id,
            s.nome,
            s.descricao,
            s.preco,
            s.duracao_min,
            s.ativo,

            l.nome_fantasia AS loja_nome,
            l.imagem AS loja_imagem,

            (

                6371 *
                ACOS(

                    COS(RADIANS(?))
                    *
                    COS(RADIANS(l.latitude))
                    *
                    COS(
                        RADIANS(l.longitude)
                        -
                        RADIANS(?)
                    )
                    +
                    SIN(RADIANS(?))
                    *
                    SIN(RADIANS(l.latitude))

                )

            ) AS distancia

        FROM Servicos s

        INNER JOIN Lojas l
            ON l.id = s.loja_id

        WHERE

            s.ativo = 1

            AND l.ativo = 1

            AND l.latitude IS NOT NULL

            AND l.longitude IS NOT NULL

        HAVING distancia <= ?

        ORDER BY

            distancia ASC,

            s.id DESC

        LIMIT ? OFFSET ?

    `;

    db.query(

        sql,

        [

            latitude,
            longitude,
            latitude,

            RAIO_PADRAO_KM,
            limit,
            offset

        ],

        (queryErr, results) => {
            if (queryErr) return callback(queryErr);
            callback(null, {
                dados: results,
                pagina: page,
                limite: limit,
                total,
                temMais: offset + results.length < total
            });
        }

    );

    });

};

function agruparProdutos(results) {

    const produtosMap = {};

    results.forEach(row => {

        if (!produtosMap[row.produto_id]) {
            produtosMap[row.produto_id] = {
                id: row.produto_id,
                nome: row.produto_nome,
                descricao: row.descricao,
                preco: row.preco,
                estoque: row.estoque,
                ativo: row.ativo,
                loja_id: row.loja_id,
                imagens: [],
                loja: {
                    id: row.loja_id,
                    nome: row.loja_nome,
                    logo: row.loja_logo
                }
            };
        }

        if (row.imagem_id) {
            produtosMap[row.produto_id].imagens.push({
                id: row.imagem_id,
                caminho: row.imagem_caminho,
                principal: row.imagem_principal
            });
        }
    });

    Object.values(produtosMap).forEach(produto => {
        produto.imagens.sort((a, b) => b.principal - a.principal);
    });

    return Object.values(produtosMap);
}

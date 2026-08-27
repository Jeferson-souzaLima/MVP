const db = require("../db");

const {
    RAIO_PADRAO_KM,
    LIMITE_RESULTADOS
} = require("../Config/geolocalizacaoConfig");

exports.buscarLojas = (
    latitude,
    longitude,
    callback
) => {

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
                        -
                        RADIANS(?)
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

        ORDER BY distancia ASC

        LIMIT ${LIMITE_RESULTADOS}
    `;

    db.query(

        sql,

        [
            latitude,
            longitude,
            latitude,
            RAIO_PADRAO_KM
        ],

        callback

    );

};

exports.buscarProdutos = (
    latitude,
    longitude,
    callback
) => {

    const sql = `

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

        pi.id AS imagem_id,
        pi.caminho AS imagem_caminho,
        pi.principal AS imagem_principal,

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

    FROM Produtos p

    INNER JOIN Lojas l
        ON l.id = p.loja_id

    LEFT JOIN ProdutoImagens pi
        ON pi.produto_id = p.id

    WHERE

    p.ativo = 1

    AND l.ativo = 1

    AND l.latitude IS NOT NULL

    AND l.longitude IS NOT NULL

    HAVING distancia <= ?

    ORDER BY

    distancia ASC,

    p.id DESC

    LIMIT ?
`;

    db.query(

    sql,

    [

        latitude,
        longitude,
        latitude,

        RAIO_PADRAO_KM,
        LIMITE_RESULTADOS

    ],

    (erro, resultados) => {

        if (erro) {

            return callback(erro);

        }

        callback(
            null,
            agruparProdutos(resultados)
        );

    }

);

};

exports.buscarServicos = (
    latitude,
    longitude,
    callback
) => {

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

        LIMIT ?

    `;

    db.query(

        sql,

        [

            latitude,
            longitude,
            latitude,

            RAIO_PADRAO_KM,
            LIMITE_RESULTADOS

        ],

        callback

    );

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
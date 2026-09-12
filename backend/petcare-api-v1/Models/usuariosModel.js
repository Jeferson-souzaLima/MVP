const db = require('../db');

exports.getAll = (callback) => {
    db.query('SELECT * FROM Usuarios', callback);
};

exports.getById = (id, callback) => {
    const sql = `
        SELECT
            id,
            nome,
            email,
            telefone,
            cidade,
            uf,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            latitude,
            longitude,
            tipo
        FROM Usuarios
        WHERE id = ?
        LIMIT 1
    `;

    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);

        callback(null, results[0] || null);
    });
};

exports.create = (usuario, callback) => {
    const {
        nome,
        email,
        senha_hash,
        telefone,
        tipo,
        cidade,
        uf,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        latitude,
        longitude
    } = usuario;

    const query = `
        INSERT INTO Usuarios (
            nome,
            email,
            senha_hash,
            telefone,
            tipo,
            cidade,
            uf,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            latitude,
            longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nome,
        email,
        senha_hash,
        telefone,
        tipo,
        cidade,
        uf,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        latitude,
        longitude
    ];

    db.query(query, values, callback);
};

exports.update = (id, dados, callback) => {
    const {
        nome,
        email,
        telefone,
        tipo,
        cidade,
        uf,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        latitude,
        longitude
    } = dados;

    const sql = `
        UPDATE Usuarios
        SET
            nome = ?,
            email = ?,
            telefone = ?,
            tipo = ?,
            cidade = ?,
            uf = ?,
            cep = ?,
            logradouro = ?,
            numero = ?,
            complemento = ?,
            bairro = ?,
            latitude = ?,
            longitude = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            nome,
            email,
            telefone,
            tipo,
            cidade,
            uf,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            latitude,
            longitude,
            id
        ],
        callback
    );
};

exports.updatePerfil = (id, dados, callback) => {
    const {
        nome,
        telefone,
        cidade,
        uf,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        latitude,
        longitude
    } = dados;

    const sql = `
        UPDATE Usuarios
        SET
            nome = ?,
            telefone = ?,
            cidade = ?,
            uf = ?,
            cep = ?,
            logradouro = ?,
            numero = ?,
            complemento = ?,
            bairro = ?,
            latitude = ?,
            longitude = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            nome,
            telefone,
            cidade,
            uf,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            latitude,
            longitude,
            id
        ],
        callback
    );
};
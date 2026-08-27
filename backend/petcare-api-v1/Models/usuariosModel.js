const db = require('../db');

exports.getAll = (callback) => {
    db.query('SELECT * FROM Usuarios', callback);
};

exports.create = (usuario, callback) => {
    const { nome, email, senha_hash, telefone, tipo, cidade, uf } = usuario;
    const query = `
        INSERT INTO Usuarios (nome, email, senha_hash, telefone, tipo, cidade, uf)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [nome, email, senha_hash, telefone, tipo, cidade, uf];
    db.query(query, values, callback);
};

exports.update = (id, dados, callback) => {
    const { nome, email, telefone, tipo, cidade, uf } = dados;
    const sql = `
        UPDATE Usuarios SET nome = ?, email = ?, telefone = ?, tipo = ?, cidade = ?, uf = ?
        WHERE id = ?
    `;
    db.query(sql, [nome, email, telefone, tipo, cidade, uf, id], callback);
};

exports.updatePerfil = (id, dados, callback) => {
    const { nome, telefone, cidade, uf } = dados;

    const sql = `
        UPDATE Usuarios
        SET nome = ?, telefone = ?, cidade = ?, uf = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [nome, telefone, cidade, uf, id],
        callback
    );
};
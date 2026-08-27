const db = require('../db');

exports.getAll = (callback) => {
    db.query('SELECT * FROM Lojas', callback);
};

exports.create = (loja, callback) => {
    const { usuario_id, nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem } = loja;
    const query = `
        INSERT INTO Lojas (usuario_id, nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [usuario_id, nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem];
    db.query(query, values, callback);
};

exports.update = (id, dados, callback) => {
    const { nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem } = dados;
    const sql = `
        UPDATE Lojas 
        SET nome_fantasia = ?, cnpj = ?, descricao = ?, cidade = ?, uf = ?, endereco = ?, ativo = ?, imagem = ?
        WHERE id = ?
    `;
    db.query(sql, [nome_fantasia, cnpj, descricao, cidade, uf, endereco, ativo, imagem, id], callback);
};

exports.delete = (id, callback) => {
    db.query('DELETE FROM Lojas WHERE id = ?', [id], callback);
};

//
// ===============================
// VERIFICAR SE EXISTE POR ID
// ===============================
exports.existePorId = (id, callback) => {
    const sql = `
        SELECT id
        FROM Lojas
        WHERE id = ?
        LIMIT 1
    `;
    db.query(sql, [id], callback);
};

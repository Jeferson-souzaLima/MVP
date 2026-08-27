const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { secret } = require('../Config/jwt');


// =========================
// REGISTER
// =========================
exports.register = (req, res) => {
    const { nome, email, senha } = req.body;
    const tipo = 'cliente';

    if (!nome || !email || !senha) {
        return res.status(400).json({
            mensagem: 'Nome, email e senha sÃƒÂ£o obrigatÃƒÂ³rios.'
        });
    }

    db.query('SELECT * FROM Usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length > 0) {
            return res.status(409).json({ mensagem: 'Email jÃƒÂ¡ cadastrado.' });
        }

        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) return res.status(500).send(err);

            db.query(
                'INSERT INTO Usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
                [nome, email, hash, tipo],
                (err, result) => {
                    if (err) return res.status(500).send(err);

                    const token = jwt.sign(
                        { id: result.insertId, tipo },
                        secret,
                        { expiresIn: '1d' }
                    );

                    return res.status(201).json({
                        mensagem: 'UsuÃƒÂ¡rio registrado com sucesso!',
                        token,
                        usuario: {
                            id: result.insertId,
                            nome,
                            email,
                            tipo
                        }
                    });
                }
            );
        });
    });
};

// =========================
// LOGIN
// =========================
exports.login = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: 'Email e senha sÃƒÂ£o obrigatÃƒÂ³rios.'
        });
    }

    db.query('SELECT * FROM Usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha invÃƒÂ¡lidos.' });
        }

        const usuario = results[0];

        // Compatibilidade temporÃƒÂ¡ria durante a migraÃƒÂ§ÃƒÂ£o
        const tipoUsuario = usuario.tipo;

        bcrypt.compare(senha, usuario.senha_hash, (err, isMatch) => {
            if (err) return res.status(500).send(err);

            if (!isMatch) {
                return res.status(401).json({ mensagem: 'Email ou senha invÃƒÂ¡lidos.' });
            }

            // =========================
            // LOJISTA
            // =========================
            if (tipoUsuario === 'lojista') {
                db.query(
                    'SELECT id FROM Lojas WHERE usuario_id = ? LIMIT 1',
                    [usuario.id],
                    (err, lojaResults) => {
                        if (err) return res.status(500).send(err);

                        if (lojaResults.length === 0) {
                            return res.status(400).json({
                                mensagem: 'Loja nÃƒÂ£o encontrada para este usuÃƒÂ¡rio.'
                            });
                        }

                        const lojaId = lojaResults[0].id;

                        const token = jwt.sign(
                            {
                                id: usuario.id,
                                tipo: tipoUsuario,
                                loja_id: lojaId
                            },
                            secret,
                            { expiresIn: '1d' }
                        );

                      

                        return res.json({
                            mensagem: 'Login realizado com sucesso!',
                            token,
                            usuario: {
                                id: usuario.id,
                                nome: usuario.nome,
                                email: usuario.email,
                                tipo: tipoUsuario,
                                loja_id: lojaId
                            }
                        });
                    }
                );
            } else {
                // =========================
                // CLIENTE / ADMIN / OUTROS
                // =========================
                const token = jwt.sign(
                    {
                        id: usuario.id,
                        tipo: tipoUsuario
                    },
                    secret,
                    { expiresIn: '1d' }
                );

                return res.json({
                    mensagem: 'Login realizado com sucesso!',
                    token,
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        tipo: tipoUsuario
                    }
                });
            }
        });
    });
};

// =========================
// ENDPOINT /usuarios/me
// =========================
exports.me = (req, res) => {
    const userId = req.usuario.id;

    db.query(
        'SELECT id, nome, email, tipo FROM Usuarios WHERE id = ?',
        [userId],
        (err, results) => {
            if (err) return res.status(500).send(err);

            if (results.length === 0) {
                return res.status(404).json({
                    mensagem: 'UsuÃƒÂ¡rio nÃƒÂ£o encontrado.'
                });
            }

            const usuario = results[0];

            // Se for lojista, devolve tambÃƒÂ©m a loja vinculada
            if (usuario.tipo === 'lojista') {
                db.query(
                    'SELECT id FROM Lojas WHERE usuario_id = ? LIMIT 1',
                    [usuario.id],
                    (err, lojaResults) => {
                        if (err) return res.status(500).send(err);

                        return res.json({
                            ...usuario,
                            loja_id: lojaResults.length
                                ? lojaResults[0].id
                                : null
                        });
                    }
                );
            } else {
                return res.json(usuario);
            }
        }
    );
};

// =========================
// REGISTER LOJISTA
// =========================
exports.registerLojista = (req, res) => {
    const {
        nomeFantasia,
        razaoSocial,
        cnpj,
        email,
        senha,
        telefone,
        cidade,
        uf,
        descricao
    } = req.body;

    if (!nomeFantasia || !cnpj || !email || !senha) {
        return res.status(400).json({
            mensagem: 'Campos obrigatÃƒÂ³rios faltando.'
        });
    }

    // 1) verifica se email jÃƒÂ¡ existe
    db.query('SELECT * FROM Usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length > 0) {
            return res.status(409).json({ mensagem: 'Email jÃƒÂ¡ cadastrado.' });
        }

        // 2) cria usuÃƒÂ¡rio lojista
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) return res.status(500).send(err);

            db.query(
                'INSERT INTO Usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
                [nomeFantasia, email, hash, 'lojista'],
                (err, result) => {
                    if (err) return res.status(500).send(err);

                    const usuarioId = result.insertId;

                    // 3) cria loja vinculada ao usuÃƒÂ¡rio
                    db.query(
                        `INSERT INTO Lojas 
                        (usuario_id, nome_fantasia, razao_social, cnpj, telefone, cidade, uf, descricao)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            usuarioId,
                            nomeFantasia,
                            razaoSocial,
                            cnpj,
                            telefone,
                            cidade,
                            uf,
                            descricao
                        ],
                        (err, lojaResult) => {
                            if (err) return res.status(500).send(err);

                            const lojaId = lojaResult.insertId;

                            // opcionalmente jÃƒÂ¡ loga o lojista apÃƒÂ³s cadastro
                            const token = jwt.sign(
                                {
                                    id: usuarioId,
                                    tipo: 'lojista',
                                    loja_id: lojaId
                                },
                                secret,
                                { expiresIn: '1d' }
                            );

                            return res.status(201).json({
                                mensagem: 'Lojista cadastrado com sucesso!',
                                token,
                                usuario: {
                                    id: usuarioId,
                                    nome: nomeFantasia,
                                    email,
                                    tipo: 'lojista',
                                    loja_id: lojaId
                                }
                            });
                        }
                    );
                }
            );
        });
    });
};

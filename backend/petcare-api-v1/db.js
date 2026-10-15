const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');

require('dotenv').config();

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missingEnvVars.join(', ')}`);
}

const dbPort = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error('DB_PORT deve ser um número de porta válido.');
}

const caPath = process.env.DB_SSL_CA_PATH
    ? path.resolve(process.env.DB_SSL_CA_PATH)
    : path.join(__dirname, 'ca.pem');
if (!fs.existsSync(caPath)) {
    throw new Error('Certificado CA do banco não encontrado. Configure DB_SSL_CA_PATH ou inclua ca.pem.');
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: dbPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    ssl: {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
    }
});

const transactionContext = new AsyncLocalStorage();

const db = {
    query(sql, values, callback) {
        if (typeof values === 'function') {
            callback = values;
            values = undefined;
        }
        const connection = transactionContext.getStore();
        return (connection || pool).query(sql, values, callback);
    },
    beginTransaction(callback) {
        pool.getConnection((acquireError, connection) => {
            if (acquireError) return callback(acquireError);
            transactionContext.run(connection, () => {
                connection.beginTransaction((error) => {
                    if (error) connection.release();
                    callback(error);
                });
            });
        });
    },
    commit(callback) {
        const connection = transactionContext.getStore();
        if (!connection) return callback(new Error('Nenhuma transação ativa.'));
        connection.commit((error) => {
            if (!error) connection.release();
            callback(error);
        });
    },
    rollback(callback) {
        const connection = transactionContext.getStore();
        if (!connection) return callback?.(new Error('Nenhuma transação ativa.'));
        connection.rollback((error) => {
            connection.release();
            callback?.(error);
        });
    },
    ping(callback) {
        pool.getConnection((error, connection) => {
            if (error) return callback(error);
            connection.ping((pingError) => {
                connection.release();
                callback(pingError);
            });
        });
    },
    end(callback) {
        pool.end(callback);
    }
};

module.exports = db;

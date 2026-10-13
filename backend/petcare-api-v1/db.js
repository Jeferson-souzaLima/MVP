
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
];

const missingEnvVars = requiredEnvVars.filter(
    (name) => !process.env[name]
);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Variáveis de ambiente obrigatórias ausentes: ${missingEnvVars.join(', ')}`
    );
}

const caPath = path.join(__dirname, 'ca.pem');

if (!fs.existsSync(caPath)) {
    throw new Error('Certificado CA da Aiven não encontrado: ca.pem');
}

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
    }
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }

    console.log('Conectado ao MySQL com sucesso!');
});

module.exports = connection;

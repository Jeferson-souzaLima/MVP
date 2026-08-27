const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error('A variável de ambiente JWT_SECRET é obrigatória.');
}

module.exports = { secret };

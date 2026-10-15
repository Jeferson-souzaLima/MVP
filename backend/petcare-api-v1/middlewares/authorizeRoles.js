// middlewares/authorizeRoles.js
module.exports = function authorizeRoles(...permissoesPermitidas) {
    return (req, res, next) => {
        const { usuario } = req;

        if (!usuario || !permissoesPermitidas.includes(usuario.tipo)) {
            return res.status(403).json({ mensagem: 'Acesso negado: permiss�o insuficiente.' });
        }

        next();
    };
};
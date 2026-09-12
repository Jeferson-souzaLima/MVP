require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

// Rotas
const usuariosRoutes = require('./Routes/usuarios');
const lojasRoutes = require('./Routes/lojas');
const produtosRoutes = require('./Routes/produtos');
const servicosRoutes = require('./Routes/servicos');
const pedidosRoutes = require('./Routes/pedidos');
const itensPedidoRoutes = require('./Routes/itensPedido');
const authRoutes = require('./Routes/auth');
const petsRoutes = require('./Routes/pets');
const agendaLojistaRoutes = require('./Routes/agendaLojista');
const agendamentosRoutes = require('./Routes/agendamentos');
const buscaRoutes = require('./Routes/busca');
const favoritosRoutes = require('./Routes/favoritos');
const geolocalizacaoRoutes = require("./Routes/geolocalizacao");
const pagamentosRoutes = require('./Routes/pagamentos');
const relatoriosRoutes = require('./Routes/relatorios');
const pedidosModel = require('./Models/pedidosModel');
const cepRoutes = require('./Routes/cep');

const app = express();

// Configurações
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/usuarios', usuariosRoutes);
app.use('/lojas', lojasRoutes);
app.use('/produtos', produtosRoutes);
app.use('/servicos', servicosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/itenspedido', itensPedidoRoutes);
app.use('/auth', authRoutes);
app.use('/pets', petsRoutes);
app.use('/historico', require('./Routes/historicoUsuario'));
app.use('/agenda-lojista', agendaLojistaRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/busca', buscaRoutes);
app.use('/favoritos', favoritosRoutes);
app.use('/geolocalizacao', geolocalizacaoRoutes);
app.use('/pagamentos', pagamentosRoutes);
app.use('/relatorios', relatoriosRoutes);
app.use('/cep', cepRoutes);

// Libera reservas de estoque expiradas. O pagamento aprovado fora da janela não confirma o pedido.
setInterval(() => pedidosModel.cancelarReservasExpiradas((err) => {
    if (err) console.error('Erro ao liberar reservas expiradas:', err);
}), 60 * 1000).unref();

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${ PORT }`);
});

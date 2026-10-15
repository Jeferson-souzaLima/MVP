const db = require('../db');

const HistoricoUsuarioModel = {

    // 🔹 Produtos (pedidos + itens + histórico)
    getProdutosPorUsuario(usuario_id, callback) {
        const query = `
      SELECT
        p.id AS pedido_id,
        p.total,
        p.status AS status_atual,
        p.data_pedido,
        i.id AS item_pedido_id,
        i.nome_item,
        i.quantidade,
        i.preco_unitario
      FROM pedidos p
      JOIN itenspedido i ON i.pedido_id = p.id
      WHERE p.usuario_id = ?
      AND i.tipo = 'produto'
      ORDER BY p.data_pedido DESC
    `;
        db.query(query, [usuario_id], callback);
    },

    // 🔹 Histórico de status de produto
    getHistoricoProduto(pedido_id, callback) {
        const query = `
      SELECT status, data_status
      FROM historico_pedido_status
      WHERE pedido_id = ?
      AND tipo = 'produto'
      ORDER BY data_status ASC
    `;
        db.query(query, [pedido_id], callback);
    },

    // 🔹 Serviços (agendamentos)
    getServicosPorUsuario(usuario_id, callback) {
        const query = `
      SELECT
        a.id AS agendamento_id,
        a.data_hora,
        a.status AS status_atual,
        s.nome AS servico_nome,
        l.nome_fantasia AS loja_nome
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      JOIN lojas l ON s.loja_id = l.id
      WHERE a.usuario_id = ?
      ORDER BY a.data_hora DESC
    `;
        db.query(query, [usuario_id], callback);
    },

    // 🔹 Histórico de status de serviço
    getHistoricoServico(agendamento_id, callback) {
        const query = `
      SELECT status, data_status
      FROM historico_pedido_status
      WHERE referencia_id = ?
      AND tipo = 'servico'
      ORDER BY data_status ASC
    `;
        db.query(query, [agendamento_id], callback);
    }

};

module.exports = HistoricoUsuarioModel;
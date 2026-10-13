import { api } from "./api";

const pedidoService = {
  listarPedidosLoja: (token) => {
    return api.get("/pedidos/loja", {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  atualizarStatus: (id, status, token) => {
    return api.put(
      `/pedidos/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
};

export default pedidoService;
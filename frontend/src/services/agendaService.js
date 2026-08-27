import axios from "axios";

const API_URL = "http://localhost:3000";

// ===============================
// Buscar agendamentos do lojista por data
// ===============================
export const getAgendamentosDoLogista = async (data, token) => {
  try {
    const dataFormatada = data.toISOString().split("T")[0];

    const response = await axios.get(
      `${API_URL}/agendamentos/lojista?data=${dataFormatada}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    throw error;
  }
};

// ===============================
// Atualizar status do agendamento
// ===============================
export const atualizarStatusAgendamento = async (id, status, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/agendamentos/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
};

// ===============================
// Deletar agendamento
// ===============================
export const deletarAgendamento = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_URL}/agendamentos/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    throw error;
  }
};
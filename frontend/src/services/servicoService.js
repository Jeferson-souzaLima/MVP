import axios from "axios";

export async function buscarServicos() {
  const response = await axios.get("http://localhost:3000/servicos");
  return response.data;
}
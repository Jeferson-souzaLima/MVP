import { API_URL } from "@/services/apiUrl";
// src/services/authService.js
import axios from "axios";

export const loginUser = async (email, senha) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, senha });
  return response.data; // { token, usuario, mensagem }
};
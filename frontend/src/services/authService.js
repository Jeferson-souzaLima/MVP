// src/services/authService.js
import axios from "axios";

export const loginUser = async (email, senha) => {
  const response = await axios.post("http://localhost:3000/auth/login", { email, senha });
  return response.data; // { token, usuario, mensagem }
};
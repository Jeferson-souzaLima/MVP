import { API_URL } from "@/services/apiUrl";
import axios from "axios";

export const api = axios.create({
  baseURL: `${API_URL}`, // Altere depois para URL em produção
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

export default api;
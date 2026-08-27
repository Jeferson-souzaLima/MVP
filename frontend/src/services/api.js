import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Altere depois para URL em produção
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

export default api;
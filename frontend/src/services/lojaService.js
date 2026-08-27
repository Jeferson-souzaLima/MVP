import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000' });

function authConfig(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function buscarLojas() {
  const response = await api.get('/lojas');
  return response.data;
}

export async function buscarMinhaLoja(token) { const response = await api.get('/lojas/minha', authConfig(token)); return response.data; }
export async function salvarMinhaLoja(dados, token, lojaExiste) { const config = authConfig(token); const response = lojaExiste ? await api.put('/lojas/minha', dados, config) : await api.post('/lojas/minha', dados, config); return response.data; }
export async function enviarImagemMinhaLoja(imagem, token) { const formData = new FormData(); formData.append('imagem', imagem); const response = await api.post('/lojas/minha/imagem', formData, { headers: { Authorization: `Bearer ${token}` } }); return response.data; }

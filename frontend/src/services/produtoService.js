import axios from 'axios';

export async function buscarProdutos() {
  const response = await axios.get('http://localhost:3000/produtos');
  return response.data;
}

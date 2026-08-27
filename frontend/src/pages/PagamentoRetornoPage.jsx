import { Link, useLocation } from "react-router-dom";

export default function PagamentoRetornoPage() {
  const estado = useLocation().pathname.split('/').pop();
  const textos = {
    sucesso: ['Pagamento recebido', 'Estamos confirmando o pagamento. Você poderá acompanhar o pedido pelo histórico.'],
    falha: ['Pagamento não concluído', 'Nenhuma cobrança foi confirmada. Você pode voltar ao carrinho e tentar novamente.'],
    pendente: ['Pagamento pendente', 'Aguardamos a confirmação do Mercado Pago. Atualizaremos o pedido assim que ela ocorrer.']
  };
  const [titulo, mensagem] = textos[estado] || textos.pendente;
  return <main className="mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-bold text-green-800">{titulo}</h1><p className="mt-4 text-gray-600">{mensagem}</p><Link className="mt-8 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white" to="/historico">Ver meus pedidos</Link></main>;
}

import { useState } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { Footer } from "../components/layout/Footer";
import CarrinhoItem from "../components/cards/CarrinhoItem";
import api from "../services/api";

export default function CarrinhoPage() {
  const { carrinho, aumentarQuantidade, diminuirQuantidade, removerItem } =
    useCarrinho();

  const [retirada, setRetirada] = useState("retirada");
  const [contato, setContato] = useState({ nome: "", telefone: "" });
  const [endereco, setEndereco] = useState({ cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });
  const [erro, setErro] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  if (!carrinho.itens.length)
    return (
      <div className="bg-[#EBE9E9] min-h-screen flex flex-col">
        <main className="flex-1">
          <p className="text-center mt-10">
            Seu carrinho está vazio
          </p>
        </main>

        <Footer />
      </div>
    );

  const totalFormatado = carrinho.total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const retiradas = [{ id: "retirada", nome: "Retirar na loja" }, { id: "entrega", nome: "Receber em casa" }];

  async function finalizarPedido() {
    setErro("");
    if (!contato.nome.trim() || !contato.telefone.trim()) return setErro("Informe nome e telefone para contato.");
    let enderecoComCoordenadas = endereco;
    if (retirada === "entrega") {
      if (!endereco.cep.replace(/\D/g, "").match(/^\d{8}$/) || !endereco.logradouro || !endereco.numero || !endereco.cidade || !endereco.uf) return setErro("Preencha todos os campos obrigatórios do endereço.");
      if (!navigator.geolocation) return setErro("Seu navegador não permite calcular a distância de entrega.");
      try {
        const coordenadas = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition((posicao) => resolve({ latitude: posicao.coords.latitude, longitude: posicao.coords.longitude }), reject, { enableHighAccuracy: true, timeout: 10000 }));
        enderecoComCoordenadas = { ...endereco, ...coordenadas };
      } catch { return setErro("Permita o acesso à localização para calcular o frete."); }
    }
    setFinalizando(true);
    try {
      const resposta = await api.post("/pedidos/checkout", { loja_id: carrinho.loja_id, itens: carrinho.itens.map((item) => ({ produto_id: item.item_id, quantidade: item.quantidade })), modalidade_entrega: retirada, contato, endereco: enderecoComCoordenadas });
      window.location.assign(resposta.data.checkout_url);
    } catch (requestError) {
      setErro(requestError.response?.data?.mensagem || "Não foi possível iniciar o pagamento.");
      setFinalizando(false);
    }
  }

  return (
  <div className="bg-[#EBE9E9] min-h-screen flex flex-col">
    <main className="flex-1">
      <div className="max-w-4xl mx-auto p-4">

      {/* ITENS */}
      <div className="space-y-4">
        {carrinho.itens.map((item) => (
          <CarrinhoItem
            key={item.item_id}
            item={item}
            onIncrease={() => aumentarQuantidade(item.item_id)}
            onDecrease={() => diminuirQuantidade(item.item_id)}
            onRemove={() => removerItem(item.item_id)}
          />
        ))}
      </div>

      {/* RETIRADA */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">
          Forma de retirada
        </h2>

        <div className="flex gap-3">
          {retiradas.map((op) => (
            <button
              key={op.id}
              onClick={() => setRetirada(op.id)}
              className={`flex-1 border rounded-xl py-3 font-medium transition
                ${
                  retirada === op.id
                    ? "border-green-700 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-600"
                }
              `}
            >
              {op.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">Nome<input className="mt-1 w-full rounded border p-3" value={contato.nome} onChange={(e) => setContato({ ...contato, nome: e.target.value })} /></label>
        <label className="text-sm font-semibold">Telefone<input className="mt-1 w-full rounded border p-3" value={contato.telefone} onChange={(e) => setContato({ ...contato, telefone: e.target.value })} /></label>
      </div>

      {retirada === "entrega" && <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-lg font-semibold">Endereço de entrega</h2>
        {[["cep", "CEP"], ["logradouro", "Endereço"], ["numero", "Número"], ["complemento", "Complemento"], ["bairro", "Bairro"], ["cidade", "Cidade"], ["uf", "UF"]].map(([campo, rotulo]) => <label key={campo} className="text-sm font-semibold">{rotulo}<input className="mt-1 w-full rounded border p-3" maxLength={campo === "uf" ? 2 : undefined} value={endereco[campo]} onChange={(e) => setEndereco({ ...endereco, [campo]: campo === "uf" ? e.target.value.toUpperCase() : e.target.value })} /></label>)}
      </div>}

      {/* PAGAMENTO */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">
          Pagamento
        </h2>

        <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Você escolherá Pix ou cartão com segurança no Checkout do Mercado Pago.</p>
      </div>

      {/* TOTAL E PAGAMENTO */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>

          <span className="text-xl font-bold text-green-700">
            {totalFormatado}
          </span>
        </div>

        {erro && (
          <p className="mt-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        <button
          className="mt-3 w-full bg-green-700 text-white py-3 rounded-xl font-semibold"
          disabled={finalizando}
          onClick={finalizarPedido}
        >
          {finalizando
            ? "Preparando pagamento..."
            : "Ir para pagamento"}
        </button>
      </div>
    </div>
  </main>

    <Footer />
  </div> 
  );
}

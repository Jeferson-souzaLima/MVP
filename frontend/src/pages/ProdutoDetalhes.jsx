import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";

export default function ProdutoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [mostrarMais, setMostrarMais] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/produtos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar o produto");
        return res.json();
      })
      .then((data) => {
        setProduto(data);
        setLoading(false);
      })
      .catch((err) => {
        setErro(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <p className="text-center mt-20 text-gray-600">Carregando...</p>;

  if (erro)
    return <p className="text-center mt-20 text-red-500">{erro}</p>;

  if (!produto) return null;

  const totalFormatado = (produto.preco * quantidade).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const descricaoCurta =
    produto.descricao.length > 140
      ? produto.descricao.slice(0, 140) + "..."
      : produto.descricao;

  function handleAdicionarAoCarrinho() {
    adicionarItem({
      tipo: "produto",
      item_id: produto.id,
      nome_item: produto.nome,
      preco_unitario: produto.preco,
      quantidade,
      loja_id: produto.loja.id,
      loja_nome: produto.loja.nome,
      imagem: produto.imagens?.[0]?.caminho || null,
    });

    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  return (
    <div className="min-h-screen bg-[#0E5617] flex flex-col">
      {/* IMAGEM */}
      <div className="w-full h-[55vh] bg-white flex items-center justify-center relative">
        <img
          src={
            produto.imagens?.length
              ? `http://localhost:3000${produto.imagens[imagemAtiva].caminho}`
              : "/images/produto-padrao.jpg"
          }
          alt={produto.nome}
          className="max-h-full object-contain"
        />

        {produto.imagens?.length > 1 && (
          <div className="absolute bottom-4 flex gap-2">
            {produto.imagens.map((img, index) => (
              <img
                key={index}
                src={`http://localhost:3000${img.caminho}`}
                onClick={() => setImagemAtiva(index)}
                className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 ${
                  imagemAtiva === index
                    ? "border-green-700"
                    : "border-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white rounded-t-3xl -mt-6 p-6 shadow-xl space-y-5">
        <h1 className="text-2xl font-semibold text-[#0E5617] text-center">
          {produto.nome}
        </h1>

        {/* PREÇO */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Valor</span>
          <span className="text-2xl font-bold">{totalFormatado}</span>
        </div>

        {/* CONFIANÇA */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 text-center">
          <div>✔ Compra segura</div>
          <div>✔ Loja verificada</div>
          <div>✔ Retirada rápida</div>
        </div>

        {/* DESCRIÇÃO */}
        <div>
          <h3 className="font-bold text-gray-700 mb-1">Descrição</h3>
          <p className="text-sm text-gray-600">
            {mostrarMais ? produto.descricao : descricaoCurta}
            {produto.descricao.length > 140 && (
              <button
                onClick={() => setMostrarMais(!mostrarMais)}
                className="ml-1 font-semibold text-[#0E5617]"
              >
                {mostrarMais ? "Menos" : "Mais"}
              </button>
            )}
          </p>
        </div>

        {/* QUANTIDADE */}
        <div className="flex items-center gap-3 border rounded-lg px-3 py-2">
          <span className="text-gray-600 font-medium">Quantidade</span>
          <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>−</button>
          <span className="font-semibold">{quantidade}</span>
          <button onClick={() => setQuantidade(q => q + 1)}>+</button>
        </div>

        {/* VENDIDO POR */}
        <p className="text-sm text-gray-500 text-center">
          Vendido por{" "}
          <span className="font-semibold text-gray-700">
            {produto.loja.nome}
          </span>
        </p>

        <button
          onClick={() => navigate(`/lojas/${produto.loja.id}`)}
          className="w-full border border-[#0E5617] text-[#0E5617] font-semibold py-2 rounded-xl"
        >
          Ver mais produtos deste fornecedor
        </button>

        {/* CTA */}
        <button
          onClick={handleAdicionarAoCarrinho}
          className="w-full bg-[#0E5617] text-white font-bold py-4 rounded-xl hover:bg-green-800 transition"
        >
          Adicionar ao carrinho
        </button>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">
          Produto adicionado ao carrinho 🛒
        </div>
      )}
    </div>
  );
}
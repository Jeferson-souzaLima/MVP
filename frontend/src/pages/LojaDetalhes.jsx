import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Minus,
  ShoppingCart,
  MessageCircle,
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import { useCarrinho } from "../context/CarrinhoContext";

export default function LojaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();

  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("produtos");
  const [itens, setItens] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [notificacao, setNotificacao] = useState(null);

  // CARREGA DADOS DA LOJA
  useEffect(() => {
    fetch(`http://localhost:3000/lojas/${id}`)
      .then((res) => res.json())
      .then(setLoja)
      .catch(() => setErro("Erro ao carregar loja"))
      .finally(() => setLoading(false));
  }, [id]);

  // CARREGA PRODUTOS OU SERVIÇOS
  useEffect(() => {
    const url =
      abaAtiva === "produtos"
        ? `http://localhost:3000/produtos/loja/${id}`
        : `http://localhost:3000/servicos/loja/${id}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("ABA:", abaAtiva);
        console.log("RESPOSTA DA API:", data);

        if (Array.isArray(data)) {
          setItens(data);
        } else {
          console.error("API RETORNOU ALGO QUE NÃO É ARRAY:", data);
          setItens([]);
        }
      })
      .catch((err) => {
        console.error("ERRO AO CARREGAR ITENS:", err);
        setItens([]);
      });
  }, [abaAtiva, id]);

  function aumentar(idProduto) {
    setQuantidades((prev) => ({
      ...prev,
      [idProduto]: (prev[idProduto] || 0) + 1,
    }));
  }

  function diminuir(idProduto) {
    setQuantidades((prev) => {
      const atual = prev[idProduto] || 0;
      if (atual <= 1) {
        const novo = { ...prev };
        delete novo[idProduto];
        return novo;
      }
      return { ...prev, [idProduto]: atual - 1 };
    });
  }

  function adicionarAoCarrinho(item) {
    const quantidade = quantidades[item.id];
    if (!quantidade) return;

    adicionarItem({
      tipo: "produto",
      item_id: item.id,
      nome_item: item.nome,
      preco_unitario: item.preco,
      quantidade,
      loja_id: loja.id,
      loja_nome: loja.nome_fantasia,
      imagem: item.imagens?.[0]?.caminho || null,
    });

    setNotificacao(`${item.nome} adicionado ao carrinho`);
    setTimeout(() => setNotificacao(null), 2000);

    setQuantidades((prev) => {
      const novo = { ...prev };
      delete novo[item.id];
      return novo;
    });
  }

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* 🔔 NOTIFICAÇÃO */}
      {notificacao && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm flex items-center gap-2">
            <ShoppingCart size={16} />
            {notificacao}
          </div>
        </div>
      )}

      {/* CABEÇALHO DA LOJA */}
      <div className="bg-[#eceeec] rounded-b-3xl p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={`http://localhost:3000${loja.imagem}`}
            alt={loja.nome_fantasia}
            className="w-20 h-20 rounded-full border-4 border-green-900"
          />

          <h1 className="mt-2 text-lg font-bold text-green-900">
            {loja.nome_fantasia}
          </h1>

          {/* Infos rápidas */}
          <div className="flex gap-4 mt-3 text-xs text-gray-700">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500" />
              4.8
            </div>

            <div className="flex items-center gap-1">
              <Clock size={14} />
              Responde rápido
            </div>

            {loja.cidade && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                {loja.cidade}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 mt-4">
            <button className="flex items-center gap-1 px-4 py-2 bg-green-900 text-white text-xs rounded-full">
              <MessageCircle size={14} />
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex justify-center gap-4 mt-6">
        {["produtos", "servicos"].map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            className={`px-6 py-2 rounded-full font-semibold ${
              abaAtiva === aba
                ? "bg-green-900 text-white"
                : "bg-[#eceeec] text-green-900"
            }`}
          >
            {aba === "produtos" ? "Produtos" : "Serviços"}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="mt-6 divide-y">
        {itens.map((item) => {
          const qtd = quantidades[item.id] || 0;

          if (abaAtiva === "produtos") {
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/produtos/${item.id}`)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex-1">
                  <h2 className="text-green-900 font-semibold text-sm">
                    {item.nome}
                  </h2>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {item.descricao}
                  </p>
                  <p className="text-green-700 font-bold text-sm mt-1">
                    R$ {Number(item.preco).toFixed(2)}
                  </p>
                </div>

                <img
                  src={
                    item.imagens?.length
                      ? `http://localhost:3000${item.imagens[0].caminho}`
                      : "/images/produto-padrao.jpg"
                  }
                  alt={item.nome}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center gap-2"
                >
                  {qtd === 0 ? (
                    <button
                      onClick={() => aumentar(item.id)}
                      className="px-3 py-2 bg-green-900 text-white text-xs rounded-lg"
                    >
                      +
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => diminuir(item.id)}
                        className="p-1 bg-gray-200 rounded"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="text-sm font-semibold">{qtd}</span>

                      <button
                        onClick={() => aumentar(item.id)}
                        className="p-1 bg-green-900 text-white rounded"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}

                  {qtd > 0 && (
                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-800 text-white text-xs rounded-lg hover:bg-green-700"
                    >
                      <ShoppingCart size={14} />
                      Adicionar
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // SERVIÇOS
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/agendar/${id}/${item.id}`)}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex-1">
                <h2 className="text-green-900 font-semibold text-sm">
                  {item.nome}
                </h2>
                <p className="text-gray-600 text-xs">{item.descricao}</p>
                <p className="text-green-700 font-bold text-sm mt-1">
                  R$ {Number(item.preco).toFixed(2)}
                </p>
              </div>

              <button className="px-3 py-2 bg-green-900 text-white text-xs rounded-lg">
                Agendar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
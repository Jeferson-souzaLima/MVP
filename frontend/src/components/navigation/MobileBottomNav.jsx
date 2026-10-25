import { getMediaUrl } from "@/services/mediaUrl";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Search,
  ShoppingCart,
  User,
  Package,
  Store,
  Scissors,
  X,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Check,
  Heart,
  CalendarDays,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useCarrinho } from "../../context/CarrinhoContext";

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();

  const {
    carrinho,
    aumentarQuantidade,
    diminuirQuantidade,
    removerItem,
    ultimoItemAdicionado,
  } = useCarrinho();

  const timerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const longPressRef = useRef(false);
  const ignorarProximoClickRef = useRef(false);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const ultimoToastTimestampRef = useRef(null);

  const [menuAberto, setMenuAberto] = useState(null);
  const [pressionando, setPressionando] = useState(null);
  const [historicoBusca, setHistoricoBusca] = useState([]);
  const [toastVisivel, setToastVisivel] = useState(false);

  // Esta navegação é exclusiva do cliente.
  if (usuario?.tipo === "lojista") {
    return null;
  }

  const carrinhoTemItens = carrinho.itens.length > 0;
  const carrinhoAberto = menuAberto === "carrinho";

  function estaAtivo(area) {
    const path = location.pathname;

    switch (area) {
      case "inicio":
        return path === "/";

      case "explorar":
        return (
          path === "/busca" ||
          path.startsWith("/produtos/") ||
          path.startsWith("/lojas/") ||
          path.startsWith("/agendar/")
        );

      case "carrinho":
        return path === "/carrinho";

      case "conta":
        return (
          path === "/perfil" ||
          path === "/meus-pedidos" ||
          path === "/meus-agendamentos" ||
          path === "/favoritos"
        );

      default:
        return false;
    }
  }

  function limparLongPress() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function iniciarPressao(event, area) {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    longPressRef.current = false;

    startPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    limparLongPress();

    setPressionando(area);

    timerRef.current = setTimeout(() => {
      longPressRef.current = true;
      ignorarProximoClickRef.current = true;
      setPressionando(null);

      if (area === "busca") {
        const historico = JSON.parse(
          localStorage.getItem("petcare_historico_busca") || "[]"
        );

        setHistoricoBusca(historico);
      }

      setMenuAberto(
        area === "busca" ? "explorar" : area
      );
    }, 400);
  }

  function verificarMovimento(event) {
    const inicio = startPositionRef.current;

    const distanciaX = Math.abs(
      event.clientX - inicio.x
    );

    const distanciaY = Math.abs(
      event.clientY - inicio.y
    );

    if (distanciaX > 10 || distanciaY > 10) {
      limparLongPress();
      setPressionando(null);
    }
  }

  function finalizarPressao() {
    limparLongPress();
    setPressionando(null);
  }

  function handleInicioClick() {
    if (ignorarProximoClickRef.current) {
      ignorarProximoClickRef.current = false;
      longPressRef.current = false;
      return;
    }

    if (menuAberto === "inicio") {
      setMenuAberto(null);
      return;
    }

    navigate("/");
  }

  function handleBuscaClick() {
    if (ignorarProximoClickRef.current) {
      ignorarProximoClickRef.current = false;
      longPressRef.current = false;
      return;
    }

    if (menuAberto === "explorar") {
      setMenuAberto(null);
      return;
    }

    navigate("/busca");
  }

  function handleCarrinhoClick() {
    if (ignorarProximoClickRef.current) {
      ignorarProximoClickRef.current = false;
      longPressRef.current = false;
      return;
    }

    if (menuAberto === "carrinho") {
      setMenuAberto(null);
      return;
    }

    navigate("/carrinho");
  }

  function handleContaClick() {
    if (ignorarProximoClickRef.current) {
      ignorarProximoClickRef.current = false;
      longPressRef.current = false;
      return;
    }

    if (menuAberto === "conta") {
      setMenuAberto(null);
      return;
    }

    navigate("/perfil");
  }

  function handleOpcaoConta(rota) {
    setMenuAberto(null);
    navigate(rota);
  }

  function handleOpcaoInicio(categoria) {
    setMenuAberto(null);
    navigate(`/?categoria=${categoria}`);
  }

  function mostrarToast() {
    setToastVisivel(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToastVisivel(false);
    }, 2500);
  }

  useEffect(() => {
    if (!ultimoItemAdicionado?.timestamp) {
      return;
    }

    if (
      ultimoToastTimestampRef.current ===
      ultimoItemAdicionado.timestamp
    ) {
      return;
    }

    ultimoToastTimestampRef.current =
      ultimoItemAdicionado.timestamp;

    mostrarToast();
  }, [ultimoItemAdicionado]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest("[data-mobile-nav]")
      ) {
        setMenuAberto(null);
      }
    }

    document.addEventListener(
      "pointerdown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      limparLongPress();

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const itens = [
    {
      id: "inicio",
      label: "Início",
      icon: Home,
    },
    {
      id: "explorar",
      label: "Explorar",
      icon: Search,
      onClick: () => navigate("/busca"),
    },
    {
      id: "carrinho",
      label: "Carrinho",
      icon: ShoppingCart,
      onClick: handleCarrinhoClick,
    },
    {
      id: "conta",
      label: "Conta",
      icon: User,
      onClick: () => navigate("/perfil"),
    },
  ];

  return (
    <>
      {toastVisivel && (
        <div
          className="
            fixed
            left-1/2
            -translate-x-1/2
            bottom-24
            z-[60]
            flex
            items-center
            gap-2
            bg-[#0E5617]
            text-white
            px-4
            py-2.5
            rounded-full
            shadow-xl
            text-sm
            font-semibold
            whitespace-nowrap
            animate-in
            fade-in
            slide-in-from-bottom-2
            duration-200
          "
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
            <Check className="w-3.5 h-3.5" />
          </span>

          Produto adicionado ao carrinho!
        </div>
      )}

      <nav
        data-mobile-nav
        className="
          fixed
          bottom-4
          left-1/2
          -translate-x-1/2
          z-50
          md:hidden
          bg-white
          border
          border-gray-200
          shadow-xl
          rounded-full
          px-2
          py-1.5
        "
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-1">
          {itens.map((item) => {
            const Icon = item.icon;
            const ativo = estaAtivo(item.id);

            const isInicio = item.id === "inicio";
            const isBusca = item.id === "explorar";
            const isCarrinho = item.id === "carrinho";
            const isConta = item.id === "conta";

            const menuDesteItem =
              menuAberto === item.id;

            return (
              <div
                key={item.id}
                className="relative"
              >
                {/* MENU INÍCIO */}
                {isInicio &&
                  menuDesteItem && (
                    <div
                      className="
                        absolute
                        bottom-full
                        left-1/2
                        -translate-x-1/2
                        w-[92px]
                        mb-3
                        bg-white
                        border
                        border-gray-200
                        rounded-2xl
                        shadow-xl
                        overflow-hidden
                        p-1
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleOpcaoInicio(
                            "produtos"
                          )
                        }
                        className="
                          w-full
                          flex
                          flex-col
                          items-center
                          justify-center
                          gap-1
                          py-2.5
                          rounded-xl
                          text-gray-700
                          font-semibold
                          text-[10px]
                          hover:bg-green-50
                          hover:text-[#0E5617]
                          transition-colors
                        "
                      >
                        <Package className="w-5 h-5" />
                        <span>Produtos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpcaoInicio(
                            "lojas"
                          )
                        }
                        className="
                          w-full
                          flex
                          flex-col
                          items-center
                          justify-center
                          gap-1
                          py-2.5
                          rounded-xl
                          text-gray-700
                          font-semibold
                          text-[10px]
                          hover:bg-green-50
                          hover:text-[#0E5617]
                          transition-colors
                        "
                      >
                        <Store className="w-5 h-5" />
                        <span>Lojas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpcaoInicio(
                            "servicos"
                          )
                        }
                        className="
                          w-full
                          flex
                          flex-col
                          items-center
                          justify-center
                          gap-1
                          py-2.5
                          rounded-xl
                          text-gray-700
                          font-semibold
                          text-[10px]
                          hover:bg-green-50
                          hover:text-[#0E5617]
                          transition-colors
                        "
                      >
                        <Scissors className="w-5 h-5" />
                        <span>Serviços</span>
                      </button>
                    </div>
                  )}

                {/* MENU HISTÓRICO */}
                {isBusca &&
                  menuDesteItem && (
                    <div
                      className="
                        absolute
                        bottom-full
                        left-1/2
                        -translate-x-1/2
                        w-[180px]
                        mb-3
                        bg-white
                        border
                        border-gray-200
                        rounded-2xl
                        shadow-xl
                        p-2
                        max-h-[260px]
                        overflow-y-auto
                      "
                    >
                      {historicoBusca.length === 0 ? (
                        <div className="px-3 py-4 text-center">
                          <Search className="w-5 h-5 mx-auto text-gray-400 mb-2" />

                          <p className="text-xs font-semibold text-gray-600">
                            Nenhuma pesquisa recente
                          </p>

                          <p className="text-[10px] text-gray-400 mt-1">
                            Suas pesquisas aparecerão aqui.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {historicoBusca.map(
                            (termo) => (
                              <div
                                key={termo}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  bg-gray-50
                                  border
                                  border-gray-100
                                  rounded-xl
                                  px-2.5
                                  py-2
                                "
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuAberto(
                                      null
                                    );

                                    navigate(
                                      `/busca?q=${encodeURIComponent(
                                        termo
                                      )}`
                                    );
                                  }}
                                  className="
                                    flex-1
                                    min-w-0
                                    text-left
                                    text-xs
                                    font-semibold
                                    text-gray-700
                                    truncate
                                    hover:text-[#0E5617]
                                  "
                                >
                                  {termo}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const novoHistorico =
                                      historicoBusca.filter(
                                        (item) =>
                                          item !==
                                          termo
                                      );

                                    setHistoricoBusca(
                                      novoHistorico
                                    );

                                    localStorage.setItem(
                                      "petcare_historico_busca",
                                      JSON.stringify(
                                        novoHistorico
                                      )
                                    );
                                  }}
                                  aria-label={`Excluir pesquisa ${termo}`}
                                  className="
                                    shrink-0
                                    w-6
                                    h-6
                                    flex
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-gray-400
                                    hover:bg-gray-200
                                    hover:text-gray-700
                                    transition-colors
                                  "
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* MENU CONTA */}
                {isConta && menuDesteItem && (
                  <div
                    className="
                      absolute
                      bottom-full
                      left-1/2
                      -translate-x-1/2
                      w-[170px]
                      mb-3
                      bg-white
                      border
                      border-gray-200
                      rounded-2xl
                      shadow-xl
                      overflow-hidden
                      p-1
                    "
                  >
                  
                    <button
                      type="button"
                      onClick={() => handleOpcaoConta("/meus-pedidos")}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        text-gray-700
                        font-semibold
                        text-xs
                        hover:bg-green-50
                        hover:text-[#0E5617]
                        transition-colors
                      "
                    >
                      <Package className="w-4 h-4" />
                      <span>Meus pedidos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpcaoConta("/meus-agendamentos")
                      }
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        text-gray-700
                        font-semibold
                        text-xs
                        hover:bg-green-50
                        hover:text-[#0E5617]
                        transition-colors
                      "
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span>Meus agendamentos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpcaoConta("/favoritos")}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        text-gray-700
                        font-semibold
                        text-xs
                        hover:bg-green-50
                        hover:text-[#0E5617]
                        transition-colors
                      "
                    >
                      <Heart className="w-4 h-4" />
                      <span>Favoritos</span>
                    </button>
                  </div>
                )} 

                {/* MINI CARRINHO */}
                {isCarrinho &&
                  menuDesteItem && (
                    <div
                      className="
                        absolute
                        bottom-full
                        left-1/2
                        -translate-x-1/2
                        w-[285px]
                        mb-3
                        bg-white
                        border
                        border-gray-200
                        rounded-2xl
                        shadow-xl
                        p-2.5
                      "
                    >
                      {carrinhoTemItens ? (
                        <>
                          <div className="px-1 pb-2">
                            <p className="text-sm font-bold text-gray-800">
                              Seu carrinho
                            </p>

                            <p className="text-[10px] text-gray-400">
                              {carrinho.itens.length}{" "}
                              {carrinho.itens.length ===
                              1
                                ? "item"
                                : "itens"}
                            </p>
                          </div>

                          <div
                            className="
                              space-y-2
                              max-h-[225px]
                              overflow-y-auto
                              pr-0.5
                            "
                          >
                            {carrinho.itens.map(
                              (item) => {
                                const imagem = getMediaUrl(
                                  item.imagem,
                                  "/images/produto-padrao.jpg"
                                );

                                return (
                                  <div
                                    key={
                                      item.item_id
                                    }
                                    className="
                                      bg-gray-50
                                      border
                                      border-gray-100
                                      rounded-xl
                                      p-2
                                    "
                                  >
                                    <div className="flex gap-2">
                                      <div
                                        className="
                                          shrink-0
                                          w-12
                                          h-12
                                          rounded-lg
                                          overflow-hidden
                                          bg-white
                                          border
                                          border-gray-100
                                          flex
                                          items-center
                                          justify-center
                                        "
                                      >
                                        {imagem ? (
                                          <img
                                            src={
                                              imagem
                                            }
                                            alt={item.nome_item || "Produto"}
                                            className="
                                              w-full
                                              h-full
                                              object-cover
                                            "
                                          />
                                        ) : (
                                          <Package className="w-5 h-5 text-gray-300" />
                                        )}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p
                                          className="
                                            text-xs
                                            font-semibold
                                            text-gray-700
                                            truncate
                                          "
                                        >
                                          {item.nome_item || "Produto"}
                                        </p>
                                        
                                        {item.loja_nome && (
                                          <p className="text-[10px] text-gray-400 truncate">
                                            {item.loja_nome}
                                          </p>
                                        )}

                                        <p className="text-xs font-bold text-[#0E5617] mt-0.5">
                                          {Number(
                                            item.preco_unitario ||
                                              0
                                          ).toLocaleString(
                                            "pt-BR",
                                            {
                                              style:
                                                "currency",
                                              currency:
                                                "BRL",
                                            }
                                          )}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removerItem(
                                            item.item_id
                                          )
                                        }
                                        aria-label={`Remover ${item.nome || "produto"}`}
                                        className="
                                          shrink-0
                                          w-7
                                          h-7
                                          flex
                                          items-center
                                          justify-center
                                          rounded-full
                                          text-gray-400
                                          hover:bg-red-50
                                          hover:text-red-600
                                          transition-colors
                                        "
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-[10px] text-gray-400">
                                        Quantidade
                                      </span>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            diminuirQuantidade(
                                              item.item_id
                                            )
                                          }
                                          className="
                                            w-6
                                            h-6
                                            flex
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            hover:bg-green-50
                                            hover:text-[#0E5617]
                                          "
                                          aria-label="Diminuir quantidade"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>

                                        <span className="w-6 text-center text-xs font-bold text-gray-700">
                                          {
                                            item.quantidade
                                          }
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            aumentarQuantidade(
                                              item.item_id
                                            )
                                          }
                                          className="
                                            w-6
                                            h-6
                                            flex
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            hover:bg-green-50
                                            hover:text-[#0E5617]
                                          "
                                          aria-label="Aumentar quantidade"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setMenuAberto(null);
                              navigate("/carrinho");
                            }}
                            className="
                              mt-2
                              w-full
                              flex
                              items-center
                              justify-center
                              gap-2
                              bg-[#0E5617]
                              text-white
                              rounded-xl
                              py-2.5
                              text-xs
                              font-semibold
                              hover:bg-[#0a4211]
                              transition-colors
                            "
                          >
                            Ver carrinho
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-5 text-center">
                          <ShoppingCart className="w-7 h-7 mx-auto text-gray-300 mb-2" />

                          <p className="text-xs font-semibold text-gray-600">
                            Seu carrinho está vazio
                          </p>

                          <p className="text-[10px] text-gray-400 mt-1">
                            Adicione produtos para
                            começar.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                <button
                  type="button"
                  onClick={
                    isInicio
                      ? handleInicioClick
                      : isBusca
                        ? handleBuscaClick
                        : isCarrinho
                          ? handleCarrinhoClick
                          : isConta
                            ? handleContaClick
                            : item.onClick
                  }
                  onPointerDown={
                    isInicio ||
                    isBusca ||
                    isCarrinho ||
                    isConta
                      ? (event) =>
                          iniciarPressao(
                            event,
                            isInicio
                              ? "inicio"
                              : isBusca
                                ? "busca"
                                : isCarrinho
                                  ? "carrinho"
                                  : "conta"
                          )
                      : undefined
                  }
                  onPointerMove={
                    isInicio ||
                    isBusca ||
                    isCarrinho ||
                    isConta
                      ? verificarMovimento
                      : undefined
                  }

                  onPointerUp={
                    isInicio ||
                    isBusca ||
                    isCarrinho ||
                    isConta
                      ? finalizarPressao
                      : undefined
                  }

                  onPointerCancel={
                    isInicio ||
                    isBusca ||
                    isCarrinho ||
                    isConta
                      ? finalizarPressao
                      : undefined
                  }
                  onContextMenu={
                    isInicio ||
                    isBusca ||
                    isCarrinho ||
                    isConta
                      ? (event) => event.preventDefault()
                      : undefined
                  }
                  aria-label={item.label}
                  aria-current={
                    ativo ? "page" : undefined
                  }
                  className={`
                    relative
                    overflow-visible
                    flex
                    flex-col
                    items-center
                    justify-center
                    min-w-[72px]
                    px-3
                    py-1.5
                    rounded-full
                    transition-all
                    duration-200
                    select-none
                    ${
                      ativo
                        ? "bg-[#0E5617] text-white shadow-md scale-[1.03]"
                        : "text-gray-500 hover:bg-green-50 hover:text-[#0E5617]"
                    }
                  `}
                >
                  {/* RIPPLE DO CARRINHO */}
                  {isCarrinho &&
                    carrinhoTemItens &&
                    !ativo && (
                      <span
                        className="
                          absolute
                          inset-0
                          rounded-full
                          border-2
                          border-yellow-400
                          pointer-events-none
                          animate-ping
                          opacity-60
                        "
                      />
                    )}

                  {/* PROGRESSO DO LONG PRESS */}
                  {(isInicio ||
                    isBusca ||
                    isCarrinho ||
                    isConta) && (
                    <span
                      className="
                        absolute
                        inset-0
                        bg-white/30
                        origin-left
                        pointer-events-none
                        transition-transform
                        duration-[400ms]
                        ease-linear
                        rounded-full
                      "
                      style={{
                        transform: `scaleX(${
                          pressionando ===
                          item.id
                            ? 1
                            : 0
                        })`,
                      }}
                    />
                  )}

                  <Icon className="w-5 h-5 relative z-10" />

                  <span className="text-[11px] font-semibold mt-0.5 whitespace-nowrap relative z-10">
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}

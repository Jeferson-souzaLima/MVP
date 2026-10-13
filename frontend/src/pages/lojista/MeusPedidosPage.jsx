import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaUser,
  FaCalendarAlt,
  FaTruck,
  FaStore,
  FaReceipt,
  FaSearch,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaStickyNote,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import pedidoService from "../../services/pedidoService";

export default function MeusPedidosPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");

  const [pedidoAberto, setPedidoAberto] = useState(null);

  const [periodo, setPeriodo] = useState("hoje");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");

  async function carregarPedidos(exibirCarregamento = true) {
    try {
      if (exibirCarregamento) {
        setCarregando(true);
      } else {
        setAtualizando(true);
      }

      setErro("");

      const response = await pedidoService.listarPedidosLoja(token);

      setPedidos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);

      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível carregar os pedidos."
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    if (token) {
      carregarPedidos();
    }
  }, [token]);

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const statusEmAndamento = [
    "pago",
    "em_preparo",
    "pronto_para_retirada",
    "em_entrega",
  ];

  const statusFinais = ["entregue", "cancelado"];

  /*
   * =========================================================
   * DATA
   * =========================================================
   */

  function inicioDoDia(data = new Date()) {
    const resultado = new Date(data);
    resultado.setHours(0, 0, 0, 0);
    return resultado;
  }

  function fimDoDia(data = new Date()) {
    const resultado = new Date(data);
    resultado.setHours(23, 59, 59, 999);
    return resultado;
  }

  function pedidoEstaEmAndamento(pedido) {
    return statusEmAndamento.includes(pedido.status);
  }

  function pedidoEhDeHoje(pedido) {
    const dataPedido = new Date(pedido.data_pedido);

    return (
      dataPedido >= inicioDoDia() &&
      dataPedido <= fimDoDia()
    );
  }

  /*
   * Pedidos antigos que ainda precisam de atenção.
   */
  const pedidosAntigosEmAndamento = useMemo(() => {
    return pedidos.filter(
      (pedido) =>
        !pedidoEhDeHoje(pedido) &&
        pedidoEstaEmAndamento(pedido)
    );
  }, [pedidos]);

  /*
   * =========================================================
   * INDICADORES
   * =========================================================
   */

  const quantidadeHoje = useMemo(() => {
    return pedidos.filter(pedidoEhDeHoje).length;
  }, [pedidos]);

  const quantidadeEmAndamento = useMemo(() => {
    return pedidos.filter(pedidoEstaEmAndamento).length;
  }, [pedidos]);

  const quantidadeEntregues = useMemo(() => {
    return pedidos.filter(
      (pedido) => pedido.status === "entregue"
    ).length;
  }, [pedidos]);

  const quantidadeCancelados = useMemo(() => {
    return pedidos.filter(
      (pedido) => pedido.status === "cancelado"
    ).length;
  }, [pedidos]);

  /*
   * =========================================================
   * FILTROS
   * =========================================================
   */

  const pedidosFiltrados = useMemo(() => {
    let resultado = [...pedidos];

    /*
     * FILTRO DE PERÍODO
     */
    if (periodo === "hoje") {
      resultado = resultado.filter((pedido) => {
        /*
         * Hoje mostra os pedidos de hoje.
         *
         * Pedidos de dias anteriores continuam aparecendo
         * somente se ainda estiverem em andamento, pois são
         * pendências operacionais.
         */
        return (
          pedidoEhDeHoje(pedido) ||
          pedidoEstaEmAndamento(pedido)
        );
      });
    }

    if (periodo === "ontem") {
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);

      resultado = resultado.filter((pedido) => {
        const data = new Date(pedido.data_pedido);

        return (
          data >= inicioDoDia(ontem) &&
          data <= fimDoDia(ontem)
        );
      });
    }

    if (periodo === "7dias") {
      const limite = new Date();
      limite.setDate(limite.getDate() - 7);

      resultado = resultado.filter(
        (pedido) =>
          new Date(pedido.data_pedido) >= limite
      );
    }

    if (periodo === "30dias") {
      const limite = new Date();
      limite.setDate(limite.getDate() - 30);

      resultado = resultado.filter(
        (pedido) =>
          new Date(pedido.data_pedido) >= limite
      );
    }

    /*
     * FILTRO DE STATUS
     */
    if (statusFiltro !== "todos") {
      resultado = resultado.filter((pedido) => {
        if (statusFiltro === "andamento") {
          return pedidoEstaEmAndamento(pedido);
        }

        if (statusFiltro === "finais") {
          return statusFinais.includes(pedido.status);
        }

        return pedido.status === statusFiltro;
      });
    }

    /*
     * BUSCA
     */
    const termo = busca.trim().toLowerCase();

    if (termo) {
      resultado = resultado.filter((pedido) => {
        const textoBusca = [
          pedido.id,
          pedido.nome_contato,
          pedido.telefone_contato,
          ...(pedido.itens || []).map(
            (item) => item.nome_item
          ),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return textoBusca.includes(termo);
      });
    }

    /*
     * ORDENAÇÃO
     */
    resultado.sort((a, b) => {
      if (ordenacao === "recentes") {
        return (
          new Date(b.data_pedido) -
          new Date(a.data_pedido)
        );
      }

      if (ordenacao === "antigos") {
        return (
          new Date(a.data_pedido) -
          new Date(b.data_pedido)
        );
      }

      if (ordenacao === "maior_valor") {
        return Number(b.total) - Number(a.total);
      }

      if (ordenacao === "menor_valor") {
        return Number(a.total) - Number(b.total);
      }

      return 0;
    });

    return resultado;
  }, [
    pedidos,
    periodo,
    statusFiltro,
    busca,
    ordenacao,
  ]);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  if (carregando) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <FaSyncAlt className="animate-spin text-green-900 text-2xl mr-3" />

          <p className="text-gray-600 text-lg">
            Carregando pedidos...
          </p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 font-medium">
            {erro}
          </p>

          <button
            onClick={() => carregarPedidos()}
            className="mt-4 px-5 py-2 rounded-xl bg-green-900 text-white hover:bg-green-800 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">

      {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="rounded-b-3xl bg-gradient-to-r from-green-200 to-green-300 p-8 shadow-md sm:p-10">

        <button
            type="button"
            onClick={() => navigate("/perfil-lojista")}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-900 hover:underline"
        >
            <FaArrowLeft />
            Voltar ao painel
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div className="flex items-center gap-4">

            <div className="rounded-full bg-green-900 p-4 text-2xl text-white">
                <FaBoxOpen />
            </div>

            <div>
                <h1 className="text-3xl font-bold text-green-900">
                Meus Pedidos
                </h1>

                <p className="mt-1 text-green-800">
                Gerencie e acompanhe os pedidos da sua loja.
                </p>
            </div>

            </div>

            <button
            onClick={() => carregarPedidos(false)}
            disabled={atualizando}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-900 shadow transition hover:shadow-md disabled:opacity-60"
            >
            <FaSyncAlt
                className={atualizando ? "animate-spin" : ""}
            />

            {atualizando
                ? "Atualizando..."
                : "Atualizar"}
            </button>

        </div>

        </header>

      {/* =====================================================
          INDICADORES
      ====================================================== */}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 mb-6">

        <ResumoCard
          icon={<FaCalendarAlt />}
          titulo="Hoje"
          valor={quantidadeHoje}
        />

        <ResumoCard
          icon={<FaClock />}
          titulo="Em andamento"
          valor={quantidadeEmAndamento}
          destaque={
            pedidosAntigosEmAndamento.length > 0
          }
        />

        <ResumoCard
          icon={<FaCheckCircle />}
          titulo="Entregues"
          valor={quantidadeEntregues}
        />

        <ResumoCard
          icon={<FaExclamationTriangle />}
          titulo="Cancelados"
          valor={quantidadeCancelados}
        />

      </section>

      {/* =====================================================
          ALERTA DE PEDIDOS ANTIGOS
      ====================================================== */}

      {pedidosAntigosEmAndamento.length > 0 && (
        <section className="px-2 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-start gap-3">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-700">
                  <FaExclamationTriangle />
                </div>

                <div>
                  <h2 className="font-bold text-yellow-900">
                    Atenção
                  </h2>

                  <p className="text-sm text-yellow-800 mt-1">
                    Você tem{" "}
                    <strong>
                      {pedidosAntigosEmAndamento.length}
                    </strong>{" "}
                    {pedidosAntigosEmAndamento.length === 1
                      ? "pedido em andamento"
                      : "pedidos em andamento"}{" "}
                    de dias anteriores.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPeriodo("todos");
                  setStatusFiltro("andamento");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition"
              >
                Ver pedidos
                <FaArrowRight />
              </button>

            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FILTROS
      ====================================================== */}

      <section className="px-2 mb-6">

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">

          {/* BUSCA */}

          <div className="relative mb-5">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar pedido, cliente, telefone ou produto..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-300"
            />

          </div>

          {/* FILTROS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <FiltroSelect
              label="Período"
              value={periodo}
              onChange={setPeriodo}
              options={[
                ["hoje", "Hoje"],
                ["ontem", "Ontem"],
                ["7dias", "Últimos 7 dias"],
                ["30dias", "Últimos 30 dias"],
                ["todos", "Todos"],
              ]}
            />

            <FiltroSelect
              label="Status"
              value={statusFiltro}
              onChange={setStatusFiltro}
              options={[
                ["todos", "Todos os status"],
                ["aguardando_pagamento", "Aguardando pagamento"],
                ["pago", "Pago"],
                ["em_preparo", "Em preparo"],
                [
                  "pronto_para_retirada",
                  "Pronto para retirada",
                ],
                ["em_entrega", "Em entrega"],
                ["entregue", "Entregues"],
                ["cancelado", "Cancelados"],
                ["andamento", "Em andamento"],
                ["finais", "Finalizados"],
              ]}
            />

            <FiltroSelect
              label="Ordenação"
              value={ordenacao}
              onChange={setOrdenacao}
              options={[
                ["recentes", "Mais recentes"],
                ["antigos", "Mais antigos"],
                ["maior_valor", "Maior valor"],
                ["menor_valor", "Menor valor"],
              ]}
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          RESULTADO
      ====================================================== */}

      <section className="px-2">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-lg font-semibold text-green-900">
              Pedidos
            </h2>

            <p className="text-sm text-gray-500">
              {pedidosFiltrados.length}{" "}
              {pedidosFiltrados.length === 1
                ? "pedido encontrado"
                : "pedidos encontrados"}
            </p>
          </div>

        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">

            <div className="flex justify-center mb-4">
              <div className="p-5 rounded-full bg-green-100 text-green-900 text-3xl">
                <FaBoxOpen />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-green-900">
              Nenhum pedido encontrado
            </h2>

            <p className="text-gray-600 mt-2">
              Tente alterar os filtros ou realizar uma nova busca.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {pedidosFiltrados.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                aberto={pedidoAberto === pedido.id}
                onToggle={() =>
                  setPedidoAberto(
                    pedidoAberto === pedido.id
                      ? null
                      : pedido.id
                  )
                }
              />
            ))}

          </div>
        )}

      </section>
    </div>
  );
}

/* ============================================================
   CARD DO PEDIDO
============================================================ */

function PedidoCard({
  pedido,
  aberto,
  onToggle,
}) {
  return (
    <article
      className={`bg-white rounded-2xl shadow-md border transition ${
        aberto
          ? "border-green-200 shadow-lg"
          : "border-gray-100 hover:shadow-lg"
      }`}
    >

      {/* RESUMO */}

      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6"
      >

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-3">

              <h3 className="text-xl font-bold text-green-900">
                #{pedido.id}
              </h3>

              <StatusBadge status={pedido.status} />

            </div>

            <p className="font-medium text-gray-800 mt-2">
              {pedido.nome_contato || "Cliente não informado"}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">

              <span className="flex items-center gap-1">
                <FaCalendarAlt />
                {formatarData(pedido.data_pedido)}
              </span>

              <span className="flex items-center gap-1">
                {pedido.modalidade_entrega === "entrega" ? (
                  <FaTruck />
                ) : (
                  <FaStore />
                )}

                {pedido.modalidade_entrega === "entrega"
                  ? "Entrega"
                  : "Retirada"}
              </span>

              <span className="flex items-center gap-1">
                <FaBoxOpen />
                {pedido.itens?.length || 0}{" "}
                {pedido.itens?.length === 1
                  ? "item"
                  : "itens"}
              </span>

            </div>

          </div>

          <div className="flex items-center justify-between lg:justify-end gap-5">

            <div className="text-left lg:text-right">

              <p className="text-xs text-gray-500">
                Total
              </p>

              <p className="text-xl font-bold text-green-900">
                {formatarMoeda(pedido.total)}
              </p>

            </div>

            <div className="p-3 rounded-full bg-green-50 text-green-900">
              {aberto ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>

          </div>

        </div>

      </button>

      {/* DETALHES */}

      {aberto && (
        <div className="border-t border-gray-100 p-5 sm:p-6">

          {/* CLIENTE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InfoItem
              icon={<FaUser />}
              label="Cliente"
              value={
                pedido.nome_contato ||
                "Não informado"
              }
            />

            <InfoItem
              icon={<FaPhone />}
              label="Telefone"
              value={
                pedido.telefone_contato ||
                "Não informado"
              }
            />

          </div>

          {/* ITENS */}

          <div className="mt-6">

            <h4 className="font-semibold text-green-900 mb-3">
              Itens do pedido
            </h4>

            <div className="space-y-3">

              {pedido.itens?.map((item) => (
                <div
                  key={item.item_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50 rounded-xl p-4"
                >

                  <div>

                    <p className="font-medium text-gray-800">
                      {item.nome_item}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.quantidade}x{" "}
                      {formatarMoeda(
                        item.preco_unitario
                      )}
                    </p>

                  </div>

                  <p className="font-semibold text-green-900">
                    {formatarMoeda(
                      Number(item.preco_unitario) *
                        Number(item.quantidade)
                    )}
                  </p>

                </div>
              ))}

            </div>

          </div>

          {/* ENTREGA */}

          {pedido.modalidade_entrega === "entrega" && (
            <div className="mt-6">

              <h4 className="font-semibold text-green-900 mb-3">
                Endereço de entrega
              </h4>

              <div className="bg-gray-50 rounded-xl p-4">

                <div className="flex items-start gap-3">

                  <div className="p-3 rounded-xl bg-green-50 text-green-900">
                    <FaMapMarkerAlt />
                  </div>

                  <div className="text-sm text-gray-700">

                    <p>
                      {pedido.endereco_entrega},{" "}
                      {pedido.numero_entrega}
                    </p>

                    {pedido.complemento_entrega && (
                      <p>
                        {pedido.complemento_entrega}
                      </p>
                    )}

                    <p>
                      {pedido.bairro_entrega}
                    </p>

                    <p>
                      {pedido.cidade_entrega} -{" "}
                      {pedido.uf_entrega}
                    </p>

                    <p>
                      CEP: {pedido.cep_entrega}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* OBSERVAÇÃO */}

          {pedido.observacao && (
            <div className="mt-6">

              <h4 className="font-semibold text-green-900 mb-3">
                Observação
              </h4>

              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-xl p-4">

                <div className="text-yellow-700 mt-1">
                  <FaStickyNote />
                </div>

                <p className="text-sm text-gray-700">
                  {pedido.observacao}
                </p>

              </div>

            </div>
          )}

          {/* VALORES */}

          <div className="border-t border-gray-100 mt-6 pt-5">

            <div className="space-y-2 text-sm">

              <LinhaValor
                label="Subtotal"
                valor={pedido.subtotal}
              />

              <LinhaValor
                label={
                  pedido.modalidade_entrega ===
                  "entrega"
                    ? "Taxa de entrega"
                    : "Entrega"
                }
                valor={pedido.valor_entrega}
              />

              <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">

                <span className="font-bold text-gray-800">
                  Total
                </span>

                <span className="text-xl font-bold text-green-900">
                  {formatarMoeda(pedido.total)}
                </span>

              </div>

            </div>

          </div>

          {/* AÇÕES DE STATUS */}

          <AcoesPedido pedido={pedido} />

        </div>
      )}

    </article>
  );
}

/* ============================================================
   AÇÕES DO PEDIDO
============================================================ */

function AcoesPedido({ pedido }) {
  const [processando, setProcessando] = useState(false);

  const { token } = useAuth();

  const proximoStatus = obterProximoStatus(pedido);

  async function alterarStatus() {
    if (!proximoStatus) return;

    const confirmar = window.confirm(
      `Deseja alterar o pedido #${pedido.id} para "${formatarStatus(
        proximoStatus
      )}"?`
    );

    if (!confirmar) return;

    try {
      setProcessando(true);

      await pedidoService.atualizarStatus(
        pedido.id,
        proximoStatus,
        token
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Erro ao atualizar status:",
        error
      );

      alert(
        error.response?.data?.mensagem ||
          "Não foi possível atualizar o status do pedido."
      );
    } finally {
      setProcessando(false);
    }
  }

  if (!proximoStatus) {
    return (
      <div className="border-t border-gray-100 mt-6 pt-5">

        {pedido.status === "entregue" && (
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <FaCheckCircle />
            Pedido finalizado.
          </div>
        )}

        {pedido.status === "cancelado" && (
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <FaExclamationTriangle />
            Pedido cancelado.
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 mt-6 pt-5">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <p className="text-sm text-gray-500">
            Próxima etapa
          </p>

          <p className="font-semibold text-green-900">
            {formatarStatus(proximoStatus)}
          </p>
        </div>

        <button
          type="button"
          onClick={alterarStatus}
          disabled={processando}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-900 text-white font-semibold hover:bg-green-800 transition disabled:opacity-60"
        >
          {processando ? (
            <>
              <FaSyncAlt className="animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              {pedido.status === "pago" &&
                "Iniciar preparo"}

              {pedido.status === "em_preparo" &&
                pedido.modalidade_entrega ===
                  "retirada" &&
                "Marcar como pronto"}

              {pedido.status === "em_preparo" &&
                pedido.modalidade_entrega ===
                  "entrega" &&
                "Enviar para entrega"}

              {pedido.status ===
                "pronto_para_retirada" &&
                "Marcar como entregue"}

              {pedido.status === "em_entrega" &&
                "Marcar como entregue"}

              <FaArrowRight />
            </>
          )}
        </button>

      </div>

    </div>
  );
}

/* ============================================================
   RESUMO
============================================================ */

function ResumoCard({
  icon,
  titulo,
  valor,
  destaque = false,
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-5 border ${
        destaque
          ? "border-yellow-300"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">

        <div
          className={`p-3 rounded-full ${
            destaque
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-900"
          }`}
        >
          {icon}
        </div>

        <div>

          <p className="text-sm text-gray-500">
            {titulo}
          </p>

          <p className="text-2xl font-bold text-green-900">
            {valor}
          </p>

        </div>

      </div>
    </div>
  );
}

/* ============================================================
   INFO
============================================================ */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="p-3 rounded-xl bg-green-50 text-green-900">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="font-medium text-gray-800">
          {value}
        </p>
      </div>

    </div>
  );
}

/* ============================================================
   SELECT
============================================================ */

function FiltroSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        {options.map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>

    </div>
  );
}

/* ============================================================
   LINHA DE VALOR
============================================================ */

function LinhaValor({
  label,
  valor,
}) {
  return (
    <div className="flex justify-between">

      <span className="text-gray-600">
        {label}
      </span>

      <span className="font-medium text-gray-800">
        {formatarMoeda(valor)}
      </span>

    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function StatusBadge({ status }) {
  const statusMap = {
    aguardando_pagamento: {
      label: "Aguardando pagamento",
      classes:
        "bg-yellow-100 text-yellow-800",
    },

    pago: {
      label: "Pago",
      classes:
        "bg-blue-100 text-blue-800",
    },

    em_preparo: {
      label: "Em preparo",
      classes:
        "bg-orange-100 text-orange-800",
    },

    pronto_para_retirada: {
      label: "Pronto para retirada",
      classes:
        "bg-purple-100 text-purple-800",
    },

    em_entrega: {
      label: "Em entrega",
      classes:
        "bg-indigo-100 text-indigo-800",
    },

    entregue: {
      label: "Entregue",
      classes:
        "bg-green-100 text-green-800",
    },

    cancelado: {
      label: "Cancelado",
      classes:
        "bg-red-100 text-red-800",
    },
  };

  const configuracao =
    statusMap[status] || {
      label: status,
      classes:
        "bg-gray-100 text-gray-700",
    };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${configuracao.classes}`}
    >
      {configuracao.label}
    </span>
  );
}

/* ============================================================
   PRÓXIMO STATUS
============================================================ */

function obterProximoStatus(pedido) {
  if (pedido.status === "pago") {
    return "em_preparo";
  }

  if (pedido.status === "em_preparo") {
    if (pedido.modalidade_entrega === "retirada") {
      return "pronto_para_retirada";
    }

    if (pedido.modalidade_entrega === "entrega") {
      return "em_entrega";
    }
  }

  if (pedido.status === "pronto_para_retirada") {
    return "entregue";
  }

  if (pedido.status === "em_entrega") {
    return "entregue";
  }

  return null;
}

/* ============================================================
   FORMATADORES
============================================================ */

function formatarStatus(status) {
  const statusMap = {
    aguardando_pagamento:
      "Aguardando pagamento",

    pago: "Pago",

    em_preparo:
      "Em preparo",

    pronto_para_retirada:
      "Pronto para retirada",

    em_entrega:
      "Em entrega",

    entregue:
      "Entregue",

    cancelado:
      "Cancelado",
  };

  return statusMap[status] || status;
}

function formatarData(data) {
  if (!data) {
    return "Não informado";
  }

  return new Date(data).toLocaleString(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}
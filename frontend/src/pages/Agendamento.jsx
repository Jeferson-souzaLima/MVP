import { API_URL } from "@/services/apiUrl";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  LocateFixed,
  PawPrint,
  Store,
  Truck,
  Car,
  CreditCard,
  Check,
  ShoppingBag,
} from "lucide-react";

import PetModal from "../components/modals/PetModal";
import api from "../services/api";

export default function Agendamento() {
  const { servicoId, lojaId } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [pets, setPets] = useState([]);

  const [petSelecionado, setPetSelecionado] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [transporte, setTransporte] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [processandoAgendamento, setProcessandoAgendamento] =
    useState(false);

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const [showModalPet, setShowModalPet] = useState(false);
  const [petParaEditar, setPetParaEditar] = useState(null);

  const [descricaoExpandida, setDescricaoExpandida] = useState(false);

  // ==========================================================
  // FRETE / LOCALIZAÇÃO
  // ==========================================================

  const [coordenadasEntrega, setCoordenadasEntrega] = useState(null);
  const [frete, setFrete] = useState(0);
  const [distanciaEntrega, setDistanciaEntrega] = useState(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [usandoLocalizacao, setUsandoLocalizacao] = useState(false);
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState("");
  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  const [possuiEnderecoPerfil, setPossuiEnderecoPerfil] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  // ==========================================================
  // DATA MÍNIMA
  // ==========================================================

  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());

  const dataMinima = hoje.toISOString().split("T")[0];

  // ==========================================================
  // VALIDAÇÃO
  // ==========================================================

  const formularioValido =
    petSelecionado &&
    data &&
    hora &&
    transporte;

  // ==========================================================
  // CARREGAR PETS
  // ==========================================================

  const carregarPets = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/pets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      setPets([]);
    }
  }, []);

  // ==========================================================
  // CARREGAR DADOS INICIAIS
  // ==========================================================

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setLoading(true);
        setErro(null);

        const token = localStorage.getItem("token");

        const [lojaResponse, servicoResponse] = await Promise.all([
          fetch(`${API_URL}/lojas/${lojaId}`),
          fetch(`${API_URL}/servicos/${servicoId}`),
        ]);

        if (!lojaResponse.ok) {
          throw new Error("Não foi possível carregar a loja.");
        }

        if (!servicoResponse.ok) {
          throw new Error("Não foi possível carregar o serviço.");
        }

        const lojaData = await lojaResponse.json();
        const servicoData = await servicoResponse.json();

        if (!ativo) return;

        setLoja(lojaData);
        setServico(servicoData);

        // Tenta aproveitar as coordenadas já salvas no perfil.
        if (token) {
          try {
            const perfilResponse = await fetch(
              `${API_URL}/usuarios/me`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (perfilResponse.ok) {
              const perfilData = await perfilResponse.json();
              const perfil = perfilData.usuario || perfilData;

              const enderecoPerfil = {
                cep: perfil.cep || "",
                logradouro: perfil.logradouro || "",
                numero: perfil.numero || "",
                complemento: perfil.complemento || "",
                bairro: perfil.bairro || "",
                cidade: perfil.cidade || "",
                uf: perfil.uf || "",
              };

              setEndereco(enderecoPerfil);

              const enderecoCompleto = Boolean(
                enderecoPerfil.cep &&
                enderecoPerfil.logradouro &&
                enderecoPerfil.numero &&
                enderecoPerfil.bairro &&
                enderecoPerfil.cidade &&
                enderecoPerfil.uf
              );

              setPossuiEnderecoPerfil(enderecoCompleto);

              if (
                perfil.latitude != null &&
                perfil.longitude != null
              ) {
                setCoordenadasEntrega({
                  latitude: Number(perfil.latitude),
                  longitude: Number(perfil.longitude),
                });
              }
            }
          } catch (error) {
            console.warn(
              "Não foi possível carregar os dados do perfil:",
              error
            );
          } finally {
            setCarregandoPerfil(false);
          }
        }

        await carregarPets();
      } catch (error) {
        if (ativo) {
          setErro(
            error.message || "Erro ao carregar os dados do agendamento."
          );
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [lojaId, servicoId, carregarPets]);

  // ==========================================================
  // LOCALIZAÇÃO ATUAL
  // ==========================================================

  function obterLocalizacaoAtual() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocalização não é suportada neste dispositivo."
          )
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  async function usarLocalizacaoAtual() {
    setUsandoLocalizacao(true);
    setMensagemLocalizacao("");
    setErro(null);

    try {
      const coordenadas = await obterLocalizacaoAtual();

      setCoordenadasEntrega(coordenadas);

      setMensagemLocalizacao(
        "Localização atual definida para o cálculo da busca e entrega."
      );
    } catch (error) {
      console.error("Erro ao obter localização:", error);

      setErro(
        "Não foi possível obter sua localização. Permita o acesso à localização no navegador."
      );
    } finally {
      setUsandoLocalizacao(false);
    }
  }

  // ==========================================================
  // CARREGAR HORÁRIOS
  // ==========================================================

  const carregarHorarios = async (dataSelecionada) => {
    if (!dataSelecionada) {
      setHorariosDisponiveis([]);
      return;
    }

    try {
      setCarregandoHorarios(true);
      setHorariosDisponiveis([]);
      setHora("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/agenda-lojista/horarios?servico_id=${servicoId}&data=${dataSelecionada}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.mensagem ||
            "Não foi possível carregar os horários."
        );
      }

      setHorariosDisponiveis(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      setHorariosDisponiveis([]);
    } finally {
      setCarregandoHorarios(false);
    }
  };

  // ==========================================================
  // CALCULAR FRETE REAL
  // ==========================================================

  const calcularFrete = useCallback(async () => {
    if (transporte !== "com") {
      setFrete(0);
      setDistanciaEntrega(null);
      setCalculandoFrete(false);
      return;
    }

    if (
      !lojaId ||
      !coordenadasEntrega?.latitude ||
      !coordenadasEntrega?.longitude
    ) {
      setFrete(0);
      setDistanciaEntrega(null);
      return;
    }

    try {
      setCalculandoFrete(true);
      setErro(null);

      const { data } = await api.post("/pedidos/calcular-frete", {
        loja_id: Number(lojaId),
        latitude: coordenadasEntrega.latitude,
        longitude: coordenadasEntrega.longitude,
      });

      setFrete(Number(data.frete || 0));

      setDistanciaEntrega(
        data.distancia_km != null
          ? Number(data.distancia_km)
          : null
      );
    } catch (error) {
      console.error("Erro ao calcular frete:", error);

      setFrete(0);
      setDistanciaEntrega(null);

      setErro(
        error.response?.data?.mensagem ||
          "Não foi possível calcular o valor da busca e entrega."
      );
    } finally {
      setCalculandoFrete(false);
    }
  }, [
    transporte,
    lojaId,
    coordenadasEntrega?.latitude,
    coordenadasEntrega?.longitude,
  ]);

  useEffect(() => {
    calcularFrete();
  }, [calcularFrete]);

  // ==========================================================
  // PREÇOS
  // ==========================================================

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const precoServico = Number(servico?.preco || 0);

  const total =
    precoServico +
    (transporte === "com" ? Number(frete || 0) : 0);

  // ==========================================================
  // AGENDAR
  // ==========================================================

  const handleAgendar = async () => {
    if (!petSelecionado) {
      alert("Selecione o pet.");
      return;
    }

    if (!data || !hora) {
      alert("Selecione uma data e um horário.");
      return;
    }

    if (!transporte) {
      alert("Selecione como será realizado o transporte do pet.");
      return;
    }

    if (transporte === "com") {
      if (!coordenadasEntrega) {
        alert(
          "Defina sua localização para calcular o valor da busca e entrega."
        );
        return;
      }

      if (calculandoFrete) {
        alert("Aguarde o cálculo da busca e entrega.");
        return;
      }
    }

    if (processandoAgendamento) {
      return;
    }

    const pet = pets.find(
      (item) => item.id == petSelecionado
    );

    try {
      setProcessandoAgendamento(true);
      setErro(null);

      // ======================================================
      // 1. CRIAR AGENDAMENTO
      // ======================================================

      const response = await fetch(
        `${API_URL}/agendamentos`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({
            servico_id: Number(servicoId),

            data_inicio: `${data}T${hora}:00`,

            pet_nome: pet ? pet.nome : null,

            observacoes,
          }),
        }
      );

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.message ||
            resultado.mensagem ||
            "Erro ao realizar agendamento."
        );
      }

      const agendamentoId = resultado.id;

      // ======================================================
      // 2. INICIAR PAGAMENTO
      // ======================================================

      const pagamentoResponse = await fetch(
        `${API_URL}/pagamentos/agendamento/${agendamentoId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const pagamento = await pagamentoResponse.json();

      if (!pagamentoResponse.ok) {
        throw new Error(
          pagamento.message ||
            pagamento.mensagem ||
            "O agendamento foi criado, mas não foi possível preparar o pagamento."
        );
      }

      // ======================================================
      // 3. VALIDAR CHECKOUT
      // ======================================================

      if (!pagamento.checkout_url) {
        throw new Error(
          "O pagamento foi criado, mas o endereço do Mercado Pago não foi recebido."
        );
      }

      // ======================================================
      // 4. REDIRECIONAR
      // ======================================================

      window.location.href = pagamento.checkout_url;
    } catch (error) {
      console.error(
        "Erro no fluxo de agendamento/pagamento:",
        error
      );

      setErro(
        error.message || "Erro ao realizar o agendamento."
      );

      setProcessandoAgendamento(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="bg-[#EBE9E9] min-h-screen">
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center">
            <div className="w-10 h-10 border-4 border-green-100 border-t-[#0E5617] rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-sm text-gray-600">
              Carregando agendamento...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // ERRO PRINCIPAL
  // ==========================================================

  if (erro && (!loja || !servico)) {
    return (
      <div className="bg-[#EBE9E9] min-h-screen">
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
              <CalendarDays className="w-7 h-7 text-red-600" />
            </div>

            <h1 className="mt-4 text-xl font-bold text-gray-800">
              Não foi possível carregar o agendamento
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              {erro}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                mt-6
                w-full
                rounded-xl
                bg-[#0E5617]
                text-white
                font-semibold
                py-3
                hover:bg-[#0b4612]
                transition
              "
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#EBE9E9] min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-5 md:py-8">

        {/* VOLTAR */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-gray-600
            hover:text-[#0E5617]
            transition
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="h-2 bg-[#0E5617]" />

          <div className="p-6 md:p-8">

            <div className="flex items-center gap-4">

              {/* LOGO */}
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    loja?.imagem
                      ? `${API_URL}${loja.imagem}`
                      : "/images/loja-padrao.png"
                  }
                  alt={loja?.nome_fantasia || "Loja"}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0E5617]">
                  Agendamento
                </p>

                <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
                  {servico?.nome}
                </h1>

                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Store className="w-4 h-4 text-[#0E5617]" />
                  <span>
                    {loja?.nome_fantasia || "Loja"}
                  </span>
                </div>
              </div>
            </div>

            {/* ENDEREÇO REAL */}
            {(loja?.endereco ||
              loja?.cidade ||
              loja?.cep) && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[#0E5617]" />

                  <div className="text-sm">
                    {loja?.endereco && (
                      <p className="font-medium text-gray-800">
                        {loja.endereco}
                      </p>
                    )}

                    {(loja?.cidade || loja?.uf) && (
                      <p className="mt-0.5 text-gray-600">
                        {loja?.cidade}
                        {loja?.uf ? ` - ${loja.uf}` : ""}
                      </p>
                    )}

                    {loja?.cep && (
                      <p className="mt-0.5 text-gray-500">
                        CEP: {loja.cep}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DADOS DO SERVIÇO */}
            <div className="grid grid-cols-2 gap-3 mt-5">

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock3 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Duração
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-gray-900">
                  {servico?.duracao_min} min
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Valor
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-[#0E5617]">
                  {formatarPreco(servico?.preco)}
                </p>
              </div>

            </div>

            {/* DESCRIÇÃO */}
            {servico?.descricao && (
              <div className="mt-6">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sobre o serviço
                </p>

                <p
                  className={`mt-2 text-gray-700 leading-relaxed ${
                    descricaoExpandida
                      ? ""
                      : "line-clamp-3"
                  }`}
                >
                  {servico.descricao}
                </p>

                {servico.descricao.length > 180 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDescricaoExpandida(
                        !descricaoExpandida
                      )
                    }
                    className="mt-2 text-sm font-semibold text-[#0E5617] hover:underline"
                  >
                    {descricaoExpandida
                      ? "Ver menos"
                      : "Ver mais"}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            PET
        ===================================================== */}

        <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-[#0E5617]" />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Qual é o pet?
              </h2>

              <p className="text-sm text-gray-500">
                Selecione o pet que receberá o atendimento.
              </p>
            </div>
          </div>

          {pets.length > 0 ? (
            <select
              className="
                w-full
                p-3.5
                rounded-xl
                bg-white
                border
                border-gray-300
                text-gray-800
                outline-none
                focus:border-green-600
                focus:ring-2
                focus:ring-green-100
              "
              value={petSelecionado}
              onChange={(e) =>
                setPetSelecionado(e.target.value)
              }
            >
              <option value="">
                Selecionar pet
              </option>

              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-white flex items-center justify-center">
                <PawPrint className="w-7 h-7 text-[#0E5617]" />
              </div>

              <p className="mt-4 font-semibold text-gray-800">
                Você ainda não possui pets cadastrados.
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Cadastre seu primeiro pet para continuar.
              </p>

              <button
                type="button"
                onClick={() => {
                  setPetParaEditar(null);
                  setShowModalPet(true);
                }}
                className="
                  mt-4
                  bg-[#0E5617]
                  hover:bg-[#0b4612]
                  text-white
                  px-5
                  py-2.5
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Cadastrar meu pet
              </button>
            </div>
          )}
        </section>

        {/* =====================================================
            DATA E HORÁRIO
        ===================================================== */}

        <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-[#0E5617]" />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Escolha o atendimento
              </h2>

              <p className="text-sm text-gray-500">
                Selecione a data e depois um horário disponível.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Data
            </label>

            <input
              type="date"
              className="
                w-full
                p-3.5
                rounded-xl
                bg-white
                border
                border-gray-300
                outline-none
                focus:border-green-600
                focus:ring-2
                focus:ring-green-100
              "
              value={data}
              min={dataMinima}
              onChange={(e) => {
                setData(e.target.value);
                setHora("");
                carregarHorarios(e.target.value);
              }}
            />
          </div>

          <div className="mt-5">

            <div className="flex items-center justify-between gap-3 mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Horário
              </label>

              {data && !carregandoHorarios && (
                <span className="text-xs text-gray-500">
                  {horariosDisponiveis.length}{" "}
                  {horariosDisponiveis.length === 1
                    ? "horário disponível"
                    : "horários disponíveis"}
                </span>
              )}
            </div>

            {!data ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                <Clock3 className="w-6 h-6 mx-auto text-gray-400" />

                <p className="mt-2 text-sm text-gray-500">
                  Escolha uma data para visualizar os horários.
                </p>
              </div>
            ) : carregandoHorarios ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                <div className="w-7 h-7 border-4 border-green-100 border-t-[#0E5617] rounded-full animate-spin mx-auto" />

                <p className="mt-3 text-sm text-gray-500">
                  Buscando horários disponíveis...
                </p>
              </div>
            ) : horariosDisponiveis.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
                <Clock3 className="w-7 h-7 mx-auto text-gray-400" />

                <p className="mt-2 font-semibold text-gray-700">
                  Nenhum horário disponível
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Escolha outra data para consultar a agenda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {horariosDisponiveis.map((horario) => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => setHora(horario)}
                    className={`
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      p-3
                      rounded-xl
                      border
                      font-semibold
                      transition
                      ${
                        hora === horario
                          ? "bg-[#0E5617] text-white border-[#0E5617] shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50"
                      }
                    `}
                  >
                    <Clock3 className="w-4 h-4" />
                    {horario}
                  </button>
                ))}
              </div>
            )}

            {data && hora && (
              <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-sm text-green-800">
                <Check className="w-4 h-4 shrink-0" />

                <span>
                  Atendimento em{" "}
                  <strong>
                    {new Date(
                      `${data}T00:00:00`
                    ).toLocaleDateString("pt-BR")}
                  </strong>{" "}
                  às <strong>{hora}</strong>.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            TRANSPORTE
        ===================================================== */}

        <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#0E5617]" />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Como será o transporte?
              </h2>

              <p className="text-sm text-gray-500">
                Escolha como seu pet chegará ao atendimento.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={() => {
                setTransporte("sem");
                setErro(null);
              }}
              className={`
                relative
                text-left
                rounded-2xl
                border
                p-4
                transition
                ${
                  transporte === "sem"
                    ? "border-green-700 bg-green-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-green-300"
                }
              `}
            >
              {transporte === "sem" && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0E5617] text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Car className="w-5 h-5 text-gray-600" />
                </div>

                <div className="pr-7">
                  <p className="font-semibold text-gray-800">
                    Levo meu pet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Você leva o pet até o estabelecimento.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTransporte("com");
                setErro(null);
              }}
              className={`
                relative
                text-left
                rounded-2xl
                border
                p-4
                transition
                ${
                  transporte === "com"
                    ? "border-green-700 bg-green-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-green-300"
                }
              `}
            >
              {transporte === "com" && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0E5617] text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-gray-600" />
                </div>

                <div className="pr-7">
                  <p className="font-semibold text-gray-800">
                    Busca e entrega
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    O valor será calculado de acordo com a localização.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* LOCALIZAÇÃO NECESSÁRIA PARA BUSCA */}
          {transporte === "com" && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-[#0E5617] shrink-0" />

                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">
                    Endereço da busca e entrega
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Usaremos seu endereço principal para calcular o valor da
                    busca e entrega.
                  </p>
                </div>
              </div>

              {/* CARREGANDO PERFIL */}
              {carregandoPerfil ? (
                <div className="mt-4 rounded-xl bg-white border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-green-100 border-t-[#0E5617] rounded-full animate-spin" />
                    Carregando seu endereço...
                  </div>
                </div>
              ) : possuiEnderecoPerfil ? (
                <>
                  {/* ENDEREÇO PRINCIPAL */}
                  <div className="mt-4 rounded-xl bg-white border border-green-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#0E5617]" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">
                          Endereço principal
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {endereco.logradouro}, {endereco.numero}
                          {endereco.complemento
                            ? ` - ${endereco.complemento}`
                            : ""}
                        </p>

                        <p className="text-sm text-gray-600">
                          {endereco.bairro} · {endereco.cidade} - {endereco.uf}
                        </p>

                        <p className="text-sm text-gray-600">
                          CEP: {endereco.cep}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ALTERNATIVA DE LOCALIZAÇÃO */}
                  {coordenadasEntrega ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={usarLocalizacaoAtual}
                        disabled={usandoLocalizacao}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          font-medium
                          text-gray-600
                          hover:text-[#0E5617]
                          transition
                          disabled:opacity-60
                        "
                      >
                        <LocateFixed className="w-4 h-4" />

                        {usandoLocalizacao
                          ? "Obtendo localização..."
                          : "Usar minha localização atual"}
                      </button>

                      <p className="mt-1 text-xs text-gray-500">
                        Use esta opção somente se quiser calcular a busca e entrega
                        a partir da sua localização atual.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <p className="text-sm font-semibold text-amber-800">
                        Precisamos da localização para calcular a entrega.
                      </p>

                      <p className="text-sm text-amber-700 mt-1">
                        Seu endereço está cadastrado, mas ainda não possui
                        coordenadas disponíveis.
                      </p>

                      <button
                        type="button"
                        onClick={usarLocalizacaoAtual}
                        disabled={usandoLocalizacao}
                        className="
                          mt-3
                          flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-white
                          border
                          border-amber-300
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          text-gray-700
                          hover:border-green-500
                          hover:text-[#0E5617]
                          transition
                          disabled:opacity-60
                        "
                      >
                        <LocateFixed className="w-4 h-4" />

                        {usandoLocalizacao
                          ? "Obtendo localização..."
                          : "Usar minha localização atual"}
                      </button>

                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* SEM ENDEREÇO */}
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">

                    <p className="font-semibold text-gray-800">
                      Você ainda não possui um endereço completo cadastrado.
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Para calcular a busca e entrega, precisamos da sua
                      localização.
                    </p>

                    <button
                      type="button"
                      onClick={usarLocalizacaoAtual}
                      disabled={usandoLocalizacao}
                      className="
                        mt-4
                        w-full
                        sm:w-auto
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-white
                        border
                        border-gray-300
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-gray-700
                        hover:border-green-500
                        hover:text-[#0E5617]
                        transition
                        disabled:opacity-60
                      "
                    >
                      <LocateFixed className="w-4 h-4" />

                      {usandoLocalizacao
                        ? "Obtendo localização..."
                        : "Usar minha localização atual"}
                    </button>

                  </div>
                </>
              )}

              {/* LOCALIZAÇÃO ATUAL DEFINIDA */}
              {mensagemLocalizacao && (
                <p className="mt-3 text-sm text-green-700">
                  {mensagemLocalizacao}
                </p>
              )}

              {/* CÁLCULO DO FRETE */}
              {calculandoFrete && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-green-100 border-t-[#0E5617] rounded-full animate-spin" />

                  Calculando valor da busca e entrega...
                </div>
              )}             
            </div>
          )}
        </section>

        {/* =====================================================
            OBSERVAÇÕES
        ===================================================== */}

        <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-[#0E5617]" />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Observações
              </h2>

              <p className="text-sm text-gray-500">
                Alguma informação importante sobre seu pet?
              </p>
            </div>
          </div>

          <textarea
            className="
              w-full
              min-h-[110px]
              p-3.5
              rounded-xl
              bg-white
              border
              border-gray-300
              outline-none
              resize-y
              focus:border-green-600
              focus:ring-2
              focus:ring-green-100
            "
            placeholder="Escreva aqui, se necessário..."
            value={observacoes}
            onChange={(e) =>
              setObservacoes(e.target.value)
            }
          />
        </section>

        {/* =====================================================
            RESUMO
        ===================================================== */}

        <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#0E5617]" />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Confira seu agendamento
              </h2>

              <p className="text-sm text-gray-500">
                Revise as informações antes de continuar.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Pet
              </span>

              <span className="font-semibold text-gray-800 text-right">
                {pets.find(
                  (p) => p.id == petSelecionado
                )?.nome || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Serviço
              </span>

              <span className="font-semibold text-gray-800 text-right">
                {servico?.nome || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Loja
              </span>

              <span className="font-semibold text-gray-800 text-right">
                {loja?.nome_fantasia || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Data
              </span>

              <span className="font-semibold text-gray-800 text-right">
                {data
                  ? new Date(
                      `${data}T00:00:00`
                    ).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Horário
              </span>

              <span className="font-semibold text-gray-800 text-right">
                {hora || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Atendimento
              </span>

              <span className="font-semibold text-gray-800 text-right">
                {transporte === "com"
                  ? "Busca e entrega"
                  : transporte === "sem"
                  ? "No estabelecimento"
                  : "-"}
              </span>
            </div>

            {observacoes && (
              <div className="pt-2">
                <p className="text-gray-500 mb-1">
                  Observações
                </p>

                <p className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-gray-700 whitespace-pre-wrap">
                  {observacoes}
                </p>
              </div>
            )}
          </div>

          <hr className="my-5" />

          <div className="space-y-3">

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-500">
                Serviço
              </span>

              <span className="font-medium text-gray-800">
                {formatarPreco(precoServico)}
              </span>
            </div>

            {transporte === "com" && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">
                  Busca e entrega
                </span>

                <span className="font-medium text-gray-800">
                  {calculandoFrete
                    ? "Calculando..."
                    : formatarPreco(frete)}
                </span>
              </div>
            )}
          </div>

          <hr className="my-5" />

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="text-2xl font-bold text-[#0E5617]">
                {formatarPreco(total)}
              </p>
            </div>

            <CreditCard className="w-7 h-7 text-gray-300" />
          </div>

          {erro && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                {erro}
              </p>
            </div>
          )}
        </section>

        {/* =====================================================
            PROCESSAMENTO
        ===================================================== */}

        {processandoAgendamento && (
          <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-5 text-center">

            <div className="w-9 h-9 border-4 border-green-200 border-t-[#0E5617] rounded-full animate-spin mx-auto" />

            <p className="mt-3 font-semibold text-green-800">
              Preparando seu pagamento...
            </p>

            <p className="text-sm text-green-700 mt-1">
              Você será direcionado ao Checkout do Mercado Pago.
            </p>
          </div>
        )}

        {/* =====================================================
            CTA
        ===================================================== */}

        <button
          type="button"
          onClick={handleAgendar}
          disabled={
            !formularioValido ||
            processandoAgendamento ||
            (transporte === "com" &&
              (!coordenadasEntrega || calculandoFrete))
          }
          className={`
            mt-6
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-4
            rounded-2xl
            font-bold
            transition-all
            shadow-sm
            ${
              formularioValido &&
              !processandoAgendamento &&
              !(
                transporte === "com" &&
                (!coordenadasEntrega ||
                  calculandoFrete)
              )
                ? "bg-[#0E5617] hover:bg-[#0b4612] text-white hover:shadow-md active:scale-[0.99]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {processandoAgendamento ? (
            "Preparando pagamento..."
          ) : (
            <>
              Confirmar agendamento
              <CreditCard className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="mt-3 mb-8 text-center text-xs text-gray-500">
          O pagamento será realizado com segurança pelo Mercado Pago.
        </p>
      </main>

      {/* =======================================================
          MODAL DE PET
      ======================================================= */}

      {showModalPet && (
        <PetModal
          token={localStorage.getItem("token")}
          petExistente={petParaEditar}
          onClose={() => {
            setShowModalPet(false);
            setPetParaEditar(null);
          }}
          onPetSalvo={async (novoPet) => {
            await carregarPets();

            setPetSelecionado(novoPet.id);

            setShowModalPet(false);
            setPetParaEditar(null);
          }}
        />
      )}
    </div>
  );
}
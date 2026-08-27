import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PetModal from "../components/modals/PetModal";
import { ArrowLeft } from "lucide-react";

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
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [processandoAgendamento, setProcessandoAgendamento] = useState(false);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [showModalPet, setShowModalPet] = useState(false);
  const [petParaEditar, setPetParaEditar] = useState(null);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);

  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  const dataMinima = hoje.toISOString().split("T")[0];

  const formularioValido =
  petSelecionado &&
  data &&
  hora;

  const carregarPets = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/pets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      setPets(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(err);
      setPets([]);
    }
  }, []);

    useEffect(() => {
      fetch(`http://localhost:3000/lojas/${lojaId}`)
        .then(res => res.json())
        .then(setLoja)
        .catch(() => setErro("Erro ao carregar loja"));

      fetch(`http://localhost:3000/servicos/${servicoId}`)
        .then(res => res.json())
        .then(setServico)
        .catch(() => setErro("Erro ao carregar serviço"));

      carregarPets().finally(() => setLoading(false));

    }, [lojaId, servicoId, carregarPets]);

    const calcularTotal = () => {
      const preco = parseFloat(servico?.preco || 0);
      const taxa = transporte === "com" ? 15 : 0;
      return preco + taxa;
    };

    const carregarHorarios = async (dataSelecionada) => {

    if (!dataSelecionada) return;

    try {

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/agenda-lojista/horarios?servico_id=${servicoId}&data=${dataSelecionada}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setHorariosDisponiveis(data);
      }

    } catch (error) {

      console.error(error);

    }

  };

  const handleAgendar = async () => {

    if (!data || !hora) {
      alert("Selecione uma data e um horário.");
      return;
    }

    if (processandoAgendamento) {
      return;
    }

    const pet = pets.find(p => p.id == petSelecionado);

    try {

      setProcessandoAgendamento(true);

      // ==========================================
      // 1. CRIAR AGENDAMENTO
      // ==========================================

      const response = await fetch(
        "http://localhost:3000/agendamentos",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },

          body: JSON.stringify({

            servico_id: Number(servicoId),

            data_inicio: `${data}T${hora}:00`,

            pet_nome: pet ? pet.nome : null,

            observacoes

          })

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

      // ==========================================
      // 2. INICIAR PAGAMENTO
      // ==========================================

      const pagamentoResponse = await fetch(
        `http://localhost:3000/pagamentos/agendamento/${agendamentoId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
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

      // ==========================================
      // 3. VALIDAR URL DO CHECKOUT
      // ==========================================

      if (!pagamento.checkout_url) {
        throw new Error(
          "O pagamento foi criado, mas o endereço do Mercado Pago não foi recebido."
        );
      }

      // ==========================================
      // 4. REDIRECIONAR PARA O MERCADO PAGO
      // ==========================================

      window.location.href = pagamento.checkout_url;

    } catch (error) {

      console.error("Erro no fluxo de agendamento/pagamento:", error);

      alert(
        error.message ||
        "Erro ao realizar o agendamento."
      );

      setProcessandoAgendamento(false);
    }

  };

  if (loading) return <p className="text-center mt-20">Carregando...</p>;
  if (erro) return <p className="text-center text-red-500">{erro}</p>;

  

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 bg-slate-50 min-h-screen">
      
      {/* HEADER */}

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Barra superior */}

          <div className="h-2 bg-[#0E5617]" />

          <div className="p-6">

              <div className="pb-2 mb-5 border-b border-gray-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        mb-4
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                        hover:bg-gray-50
                        transition
                    "
                  > 
                    <ArrowLeft size={18} />

                    <span className="font-medium text-gray-700">
                        Voltar
                    </span>
                </button>
              </div>
              <p className="text-sm font-medium text-[#0E5617]">
                  Agendamento
              </p>

              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                  {servico.nome}
              </h1>

              <p className="text-gray-500 mt-1">
                  {loja.nome_fantasia}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">

                  <div className="rounded-2xl border bg-gray-50 p-4">

                      <p className="text-xs uppercase tracking-wide text-gray-500">
                          Duração
                      </p>

                      <p className="text-lg font-semibold mt-1">
                          {servico.duracao_min} minutos
                      </p>

                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">

                      <p className="text-xs uppercase tracking-wide text-gray-500">
                          Valor
                      </p>

                      <p className="text-lg font-semibold text-[#0E5617] mt-1">
                          R$ {parseFloat(servico.preco).toFixed(2)}
                      </p>

                  </div>

              </div>

              {servico.descricao && (

                  <div className="mt-6">

                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                          Descrição
                      </p>

                      <p
                          className={`text-gray-700 leading-relaxed ${
                              descricaoExpandida
                                  ? ""
                                  : "line-clamp-2"
                          }`}
                      >
                          {servico.descricao}
                      </p>

                      {servico.descricao.length > 120 && (

                          <button
                              type="button"
                              onClick={() =>
                                  setDescricaoExpandida(!descricaoExpandida)
                              }
                              className="
                                  mt-2
                                  text-sm
                                  font-medium
                                  text-[#0E5617]
                                  hover:underline
                              "
                          >
                              {descricaoExpandida
                                  ? "Ver menos ▲"
                                  : "Ver mais ▼"}
                          </button>

                      )}

                  </div>

              )}

          </div>

      </div>

      {/* PET */}
      <div>
        <label className="font-semibold text-gray-700 mb-1 block">
          Pet
        </label>
        {pets.length > 0 ? (
          <select
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200"
            value={petSelecionado}
            onChange={(e) => setPetSelecionado(e.target.value)}
          >
            <option value="">Selecionar pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nome}
              </option>
            ))}
          </select>
        ) : (
          <div className="border rounded-xl p-5 bg-gray-50 text-center">
            <div className="text-4xl mb-3">
              🐶
            </div>
            <p className="font-semibold text-gray-800">
              Você ainda não possui pets cadastrados.
            </p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              Cadastre seu primeiro pet para continuar o agendamento.
            </p>
            <button
              type="button"
              onClick={() => {
                setPetParaEditar(null);
                setShowModalPet(true);
              }}
              className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-xl transition"
            >
              Cadastrar meu pet
            </button>
          </div>
        )}
      </div>

      {/* DATA E HORA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold text-gray-700 block mb-1">Data</label>
          <input
            type="date"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200"
            value={data}
            min={dataMinima}
            onChange={(e) => {
              setData(e.target.value);
              setHora("");
              carregarHorarios(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="font-semibold text-gray-700 block mb-2">
            {!data
              ? "Selecione uma data"
              : horariosDisponiveis.length > 0
                ? "Escolha um horário"
                : "Horários"}
          </label>
          {!data ? (
            <p className="text-sm text-gray-500">
              Escolha uma data para visualizar os horários disponíveis.
            </p>
          ) : horariosDisponiveis.length === 0 ? (
            <div className="border rounded-xl p-4 text-center bg-gray-50">
              <p className="text-gray-600 font-medium">
                Nenhum horário disponível.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Escolha outra data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {horariosDisponiveis.map((horario) => (
                <button
                  key={horario}
                  type="button"
                  onClick={() => setHora(horario)}
                  className={`flex items-center justify-center p-3 rounded-xl border font-medium transition
                    ${
                      hora === horario
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white hover:bg-green-50 border-gray-300"
                    }
                  `}
                >
                  {horario}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {data && hora && (
        <p className="text-sm text-gray-600">
          📅 {data.split("-").reverse().join("/")} às {hora}
        </p>
      )}

      {/* TRANSPORTE */}
      <div>
        <label className="font-semibold text-gray-700 block mb-2">
          Transporte
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setTransporte("sem")}
            className={`flex-1 p-3 rounded-xl border ${
              transporte === "sem"
                ? "bg-green-100 border-green-700"
                : "bg-white"
            }`}
          >
            🚗 Levo meu pet
          </button>
          <button
            onClick={() => setTransporte("com")}
            className={`flex-1 p-3 rounded-xl border ${
              transporte === "com"
                ? "bg-green-100 border-green-700"
                : "bg-white"
            }`}
          >
            🚚 Busca e entrega (+R$15)
          </button>
        </div>
      </div>

      {/* OBSERVAÇÕES */}
      <div>
        <label className="font-semibold text-gray-700 block mb-1">
          Observações (opcional)
        </label>
        <textarea
          className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200"
          placeholder="Algo importante sobre seu pet?"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      {/* RESUMO */}
      <div className="p-5 rounded-2xl bg-gray-50 border">
        <h3 className="font-bold text-gray-800 mb-4">
          Confira seu Agendamento
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Revise as informações antes de confirmar seu agendamento.
          </p>
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Pet</span>
            <span className="font-medium">
              {pets.find(p => p.id == petSelecionado)?.nome || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Serviço</span>
            <span className="font-medium">{servico.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Loja</span>
            <span className="font-medium"> {loja?.nome_fantasia || loja?.nome || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Data</span>
            <span className="font-medium">
              {data
                ? new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Horário</span>
            <span className="font-medium">
              {hora || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Atendimento</span>
            <span className="font-medium">
              {transporte === "com"
                ? "Leva e traz"
                : "No estabelecimento"}
            </span>
          </div>
          {observacoes && (
            <div>
              <p className="text-sm bg-white rounded-lg p-3 border italic">
                  {observacoes}
              </p>
              <p className="text-sm">
                {observacoes}
              </p>
            </div>
          )}
        </div>
        
        <hr className="my-4" />

          <div className="space-y-2">

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Serviço</span>
              <span>R$ {parseFloat(servico.preco).toFixed(2)}</span>
            </div>

            {transporte === "com" && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Leva e traz</span>
                <span>R$ 15,00</span>
              </div>
            )}

          </div>

        <hr className="my-4" />

        <div className="flex justify-between items-center">
          <span className="font-semibold">
            Total
          </span>

          <span className="text-2xl font-bold text-green-700">
            R$ {calcularTotal().toFixed(2)}
          </span>
        </div>
      </div>

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

      {/* CTA */}
      {processandoAgendamento && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
          <p className="font-semibold text-green-800">
            Agendamento realizado! 🐾
          </p>

          <p className="text-sm text-green-700 mt-1">
            Estamos preparando seu pagamento.
          </p>

          <p className="text-xs text-green-600 mt-1">
            Você será direcionado ao Mercado Pago em instantes.
          </p>
        </div>
      )}

      <button
        onClick={handleAgendar}
        disabled={!formularioValido || processandoAgendamento}
        className={`w-full py-3 rounded-xl font-semibold transition
          ${
            formularioValido && !processandoAgendamento
              ? "bg-green-700 hover:bg-green-800 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        {processandoAgendamento
          ? "⏳ Preparando seu pagamento..."
          : "Confirmar Agendamento"}
      </button>
    </div>
  );
}
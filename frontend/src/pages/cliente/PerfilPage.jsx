import { API_URL } from "@/services/apiUrl";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaPaw,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPen,
  FaTrash,
  FaCalendarAlt,
  FaSignOutAlt,
  FaCog,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaMapPin
} from "react-icons/fa";

import PetModal from "../../components/modals/PetModal";
import petService from "../../services/petService";
import api from "../../services/api";
import { Footer } from "../../components/layout/Footer";

export default function PerfilPage() {
  const {
    usuario,
    token,
    logout,
    atualizarUsuario
  } = useAuth();

  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [showUserData, setShowUserData] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const [showModalPet, setShowModalPet] = useState(false);
  const [petParaEditar, setPetParaEditar] = useState(null);

  const [campoEditando, setCampoEditando] = useState(null);
  const [valorEditando, setValorEditando] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [mensagemPerfil, setMensagemPerfil] = useState(null);

  const [usandoLocalizacao, setUsandoLocalizacao] = useState(false);

  const [editandoEndereco, setEditandoEndereco] = useState(false);

  const [enderecoForm, setEnderecoForm] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: ""
  });

  const [salvandoEndereco, setSalvandoEndereco] = useState(false);
  const [mensagemEndereco, setMensagemEndereco] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // =========================================================
  // PETS
  // =========================================================

  const carregarPets = useCallback(async () => {
    if (!usuario || !token) return;

    setLoadingPets(true);

    try {
      const { data } = await petService.listar(token);
      setPets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar pets:", err);
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  }, [usuario, token]);

  useEffect(() => {
    carregarPets();
  }, [carregarPets]);

  // =========================================================
  // PERFIL
  // =========================================================

  useEffect(() => {
    if (!token) return;

    async function carregarPerfil() {
      try {
        const { data } = await api.get("/usuarios/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        atualizarUsuario(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    }

    carregarPerfil();
  }, [token]);

  // =========================================================
  // ENDEREÇO
  // =========================================================

  function iniciarEdicaoEndereco() {
    setMensagemEndereco(null);

    setEnderecoForm({
      cep: usuario.cep || "",
      logradouro: usuario.logradouro || "",
      numero: usuario.numero || "",
      complemento: usuario.complemento || "",
      bairro: usuario.bairro || "",
      cidade: usuario.cidade || "",
      uf: usuario.uf || ""
    });

    setEditandoEndereco(true);
  }

  function cancelarEdicaoEndereco() {
    setEditandoEndereco(false);

    setEnderecoForm({
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: ""
    });

    setMensagemEndereco(null);
  }

  async function buscarCep() {
    const cep = enderecoForm.cep.replace(/\D/g, "");

    if (cep.length !== 8) {
      setMensagemEndereco({
        tipo: "erro",
        texto: "Digite um CEP válido com 8 números."
      });
      return;
    }

    setBuscandoCep(true);
    setMensagemEndereco(null);

    try {
      const { data } = await api.get(`/cep/${cep}`);

      setEnderecoForm((prev) => ({
        ...prev,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        uf: data.uf || ""
      }));

      setMensagemEndereco({
        tipo: "sucesso",
        texto: "CEP encontrado. Confira os dados e informe o número."
      });
    } catch (err) {
      console.error("Erro ao consultar CEP:", err);

      setMensagemEndereco({
        tipo: "erro",
        texto:
          err.response?.data?.mensagem ||
          "Não foi possível consultar o CEP."
      });
    } finally {
      setBuscandoCep(false);
    }
  }

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
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  async function salvarEndereco() {
    const enderecoNormalizado = {
      ...enderecoForm,
      cep: enderecoForm.cep.replace(/\D/g, ""),
      logradouro: enderecoForm.logradouro.trim(),
      numero: enderecoForm.numero.trim(),
      complemento: enderecoForm.complemento.trim(),
      bairro: enderecoForm.bairro.trim(),
      cidade: enderecoForm.cidade.trim(),
      uf: enderecoForm.uf.trim().toUpperCase()
    };

    if (
      !/^\d{8}$/.test(enderecoNormalizado.cep) ||
      !enderecoNormalizado.logradouro ||
      !enderecoNormalizado.numero ||
      !enderecoNormalizado.bairro ||
      !enderecoNormalizado.cidade ||
      !/^[A-Z]{2}$/.test(enderecoNormalizado.uf)
    ) {
      setMensagemEndereco({
        tipo: "erro",
        texto:
          "Informe CEP, endereço, número, bairro, cidade e UF válidos."
      });
      return;
    }

    setSalvandoEndereco(true);
    setMensagemEndereco(null);

    try {
      const { data } = await api.put(
        "/usuarios/me",
        enderecoNormalizado,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      atualizarUsuario(data.usuario || enderecoNormalizado);

      setMensagemEndereco({
        tipo: "sucesso",
        texto: "Endereço atualizado com sucesso."
      });

      setEditandoEndereco(false);
    } catch (err) {
      console.error("Erro ao atualizar endereço:", err);

      const mensagemBackend =
        err.response?.data?.mensagem || "";

      const erroGeocoding =
        err.response?.status === 400 &&
        mensagemBackend.toLowerCase().includes("localizar");

      if (!erroGeocoding) {
        setMensagemEndereco({
          tipo: "erro",
          texto:
            mensagemBackend ||
            "Não foi possível atualizar seu endereço."
        });

        setSalvandoEndereco(false);
        return;
      }

      const usarGps = window.confirm(
        "Não conseguimos localizar automaticamente esse endereço.\n\n" +
        "Deseja usar sua localização atual para definir a posição do endereço?"
      );

      if (!usarGps) {
        setMensagemEndereco({
          tipo: "erro",
          texto:
            "O endereço não foi localizado automaticamente. " +
            "Você pode tentar novamente ou usar sua localização atual."
        });

        setSalvandoEndereco(false);
        return;
      }

      setUsandoLocalizacao(true);

      try {
        const coordenadas = await obterLocalizacaoAtual();

        const dadosComLocalizacao = {
          ...enderecoNormalizado,
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude
        };

        const { data } = await api.put(
          "/usuarios/me",
          dadosComLocalizacao,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        atualizarUsuario(
          data.usuario || dadosComLocalizacao
        );

        setMensagemEndereco({
          tipo: "sucesso",
          texto:
            "Endereço atualizado usando sua localização atual."
        });

        setEditandoEndereco(false);
      } catch (gpsErr) {
        console.error(
          "Erro ao obter localização atual:",
          gpsErr
        );

        let mensagemGps =
          "Não foi possível obter sua localização atual.";

        if (gpsErr?.code === 1) {
          mensagemGps =
            "Permissão de localização negada. " +
            "Permita o acesso à localização e tente novamente.";
        } else if (gpsErr?.code === 2) {
          mensagemGps =
            "Não foi possível determinar sua localização.";
        } else if (gpsErr?.code === 3) {
          mensagemGps =
            "A localização demorou demais para responder. Tente novamente.";
        }

        setMensagemEndereco({
          tipo: "erro",
          texto: mensagemGps
        });
      } finally {
        setUsandoLocalizacao(false);
      }
    } finally {
      setSalvandoEndereco(false);
    }
  }

  // =========================================================
  // DADOS DO PERFIL
  // =========================================================

  function iniciarEdicao(campo) {
    setMensagemPerfil(null);
    setCampoEditando(campo);
    setValorEditando(usuario[campo] || "");
  }

  function cancelarEdicao() {
    setCampoEditando(null);
    setValorEditando("");
    setMensagemPerfil(null);
  }

  async function salvarCampo() {
    if (!campoEditando) return;

    const valor = valorEditando.trim();

    if (!valor) {
      setMensagemPerfil({
        tipo: "erro",
        texto: "Preencha o campo antes de salvar."
      });
      return;
    }

    setSalvandoPerfil(true);
    setMensagemPerfil(null);

    try {
      const dadosAtualizados = {
        [campoEditando]: valor
      };

      await api.put(
        "/usuarios/me",
        dadosAtualizados,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      atualizarUsuario(dadosAtualizados);

      setMensagemPerfil({
        tipo: "sucesso",
        texto: "Dados atualizados com sucesso."
      });

      setCampoEditando(null);
      setValorEditando("");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);

      setMensagemPerfil({
        tipo: "erro",
        texto:
          err.response?.data?.mensagem ||
          "Não foi possível atualizar seus dados."
      });
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // =========================================================
  // PET
  // =========================================================

  async function removerPet(id) {
    if (!confirm("Deseja realmente remover este pet?")) {
      return;
    }

    try {
      await petService.deletar(id, token);

      setPets((prev) =>
        prev.filter((p) => p.id !== id)
      );
    } catch (err) {
      alert("Erro ao remover pet.");
      console.log(err);
    }
  }

  // =========================================================
  // USUÁRIO NÃO LOGADO
  // =========================================================

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#EBE9E9] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />

          <h2 className="text-xl font-bold text-gray-800">
            Usuário não logado
          </h2>

          <p className="text-gray-500 mt-2">
            Faça login para acessar sua conta.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // CAMPOS
  // =========================================================

  const camposPerfil = [
    {
      campo: "nome",
      icon: <FaUser />,
      label: "Nome"
    },
    {
      campo: "email",
      icon: <FaEnvelope />,
      label: "E-mail",
      bloqueado: true
    },
    {
      campo: "telefone",
      icon: <FaPhone />,
      label: "Telefone"
    }
  ];

  const enderecoTemDados = Boolean(
    usuario.logradouro ||
    usuario.bairro ||
    usuario.cidade ||
    usuario.cep
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="bg-[#EBE9E9] min-h-screen flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <section className="bg-gradient-to-br from-[#0E5617] to-[#16752A] rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4 min-w-0">

                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <FaUser className="text-3xl md:text-4xl text-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-green-100 text-sm">
                    Minha conta
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                    Olá, {usuario.nome}!
                  </h1>

                  <p className="text-green-100 text-sm mt-1 truncate">
                    {usuario.email}
                  </p>
                </div>

              </div>

              <button
                type="button"
                aria-label="Configurações da conta"
                title="Configurações da conta"
                onClick={() => {
                  setShowUserData(!showUserData);

                  if (showUserData) {
                    cancelarEdicao();
                    cancelarEdicaoEndereco();
                  }
                }}
                className={`
                  w-11 h-11 md:w-12 md:h-12
                  rounded-full
                  flex items-center justify-center
                  shrink-0
                  transition-all duration-300
                  ${
                    showUserData
                      ? "bg-white text-[#0E5617] rotate-90"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }
                `}
              >
                <FaCog />
              </button>

            </div>
          </div>
        </section>

        {/* =====================================================
            ACESSOS RÁPIDOS
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Acesso rápido
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Acesse rapidamente as principais áreas da sua conta.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">

            <button
              type="button"
              onClick={() => navigate("/favoritos")}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <FaHeart />
              </div>

              <h3 className="font-bold text-gray-800">
                Favoritos
              </h3>

              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Produtos e lojas salvos
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/meus-agendamentos")}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <FaCalendarAlt />
              </div>

              <h3 className="font-bold text-gray-800">
                Agendamentos
              </h3>

              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Consulte seus horários
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/meus-pedidos")}
              className="col-span-2 md:col-span-1 group bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 text-[#0E5617] flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <FaShoppingBag />
              </div>

              <h3 className="font-bold text-gray-800">
                Meus pedidos
              </h3>

              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Acompanhe suas compras
              </p>
            </button>

          </div>
        </section>

        {/* =====================================================
            DADOS DA CONTA
        ====================================================== */}

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <button
            type="button"
            onClick={() => {
              setShowUserData(!showUserData);

              if (showUserData) {
                cancelarEdicao();
                cancelarEdicaoEndereco();
              }
            }}
            className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#0E5617] flex items-center justify-center shrink-0">
                <FaCog />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Dados da conta
                </h2>

                <p className="text-sm text-gray-500">
                  Dados pessoais e endereço
                </p>
              </div>

            </div>

            <div className="text-[#0E5617]">
              {showUserData ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>
          </button>

          <div
            className={`
              overflow-hidden
              transition-all duration-300 ease-out
              ${
                showUserData
                  ? "max-h-[1800px] opacity-100"
                  : "max-h-0 opacity-0"
              }
            `}
          >
            <div className="border-t border-gray-100 p-5 md:p-6 space-y-6">

              {/* DADOS PESSOAIS */}

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaUser className="text-[#0E5617]" />

                  <h3 className="font-bold text-gray-800">
                    Dados pessoais
                  </h3>
                </div>

                <div className="space-y-2">

                  {camposPerfil.map((item) => {
                    const estaEditando =
                      campoEditando === item.campo;

                    const valorExibido =
                      usuario[item.campo] ||
                      "Não informado";

                    return (
                      <div
                        key={item.campo}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-3 md:p-4"
                      >
                        {!estaEditando ? (
                          <div className="flex items-center justify-between gap-4">

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-9 h-9 rounded-lg bg-white text-[#0E5617] flex items-center justify-center shrink-0 shadow-sm">
                                {item.icon}
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                  {item.label}
                                </p>

                                <p className="font-medium text-gray-800 truncate">
                                  {valorExibido}
                                </p>
                              </div>

                            </div>

                            {item.bloqueado ? (
                              <span
                                className="text-xs text-gray-400 px-2"
                                title="O e-mail não pode ser alterado por aqui."
                              >
                                🔒
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  iniciarEdicao(item.campo)
                                }
                                className="w-9 h-9 rounded-lg bg-white text-[#0E5617] flex items-center justify-center shadow-sm hover:bg-green-50 transition"
                                aria-label={`Editar ${item.label}`}
                              >
                                <FaPen className="text-sm" />
                              </button>
                            )}

                          </div>
                        ) : (
                          <div className="space-y-3">

                            <div className="flex items-center gap-2 text-[#0E5617]">
                              {item.icon}

                              <span className="text-sm font-semibold">
                                Editando {item.label}
                              </span>
                            </div>

                            <input
                              type={
                                item.campo === "telefone"
                                  ? "tel"
                                  : "text"
                              }
                              value={valorEditando}
                              onChange={(e) =>
                                setValorEditando(
                                  e.target.value
                                )
                              }
                              autoFocus
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                              placeholder={`Digite seu ${item.label.toLowerCase()}`}
                            />

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={cancelarEdicao}
                                disabled={salvandoPerfil}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                onClick={salvarCampo}
                                disabled={salvandoPerfil}
                                className="px-4 py-2 rounded-xl bg-[#0E5617] text-white hover:bg-[#0B4312] transition disabled:opacity-50"
                              >
                                {salvandoPerfil
                                  ? "Salvando..."
                                  : "Salvar"}
                              </button>

                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* ENDEREÇO */}

              <div className="border-t border-gray-100 pt-6">

                <div className="flex items-center justify-between gap-4 mb-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#0E5617] flex items-center justify-center">
                      <FaMapMarkerAlt />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800">
                        Endereço
                      </h3>

                      <p className="text-sm text-gray-500">
                        Usado para entregas
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (editandoEndereco) {
                        cancelarEdicaoEndereco();
                      } else {
                        iniciarEdicaoEndereco();
                      }
                    }}
                    className="w-9 h-9 rounded-lg bg-gray-50 text-[#0E5617] flex items-center justify-center hover:bg-green-50 transition"
                    aria-label="Editar endereço"
                  >
                    <FaPen className="text-sm" />
                  </button>

                </div>

                {!editandoEndereco ? (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">

                    {enderecoTemDados ? (
                      <div className="space-y-2 text-sm">

                        {usuario.logradouro && (
                          <p className="font-medium text-gray-800">
                            {usuario.logradouro}
                            {usuario.numero
                              ? `, ${usuario.numero}`
                              : ""}
                          </p>
                        )}

                        {usuario.complemento && (
                          <p className="text-gray-600">
                            {usuario.complemento}
                          </p>
                        )}

                        {usuario.bairro && (
                          <p className="text-gray-600">
                            {usuario.bairro}
                          </p>
                        )}

                        {usuario.cidade && (
                          <p className="text-gray-600">
                            {usuario.cidade}
                            {usuario.uf
                              ? ` - ${usuario.uf}`
                              : ""}
                          </p>
                        )}

                        {usuario.cep && (
                          <p className="text-gray-500">
                            CEP: {usuario.cep}
                          </p>
                        )}

                        {usuario.latitude != null &&
                          usuario.longitude != null && (
                            <div className="flex items-center gap-2 text-xs text-green-700 pt-2">
                              <FaCheckCircle />
                              <span>
                                Localização definida
                              </span>
                            </div>
                          )}

                      </div>
                    ) : (
                      <div className="text-center py-4">

                        <FaMapPin className="mx-auto text-2xl text-gray-300 mb-2" />

                        <p className="font-medium text-gray-700">
                          Nenhum endereço cadastrado
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Cadastre seu endereço para facilitar suas entregas.
                        </p>

                      </div>
                    )}

                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* CEP */}

                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        CEP
                      </label>

                      <div className="flex gap-2 mt-1">

                        <input
                          type="text"
                          value={enderecoForm.cep}
                          onChange={(e) =>
                            setEnderecoForm({
                              ...enderecoForm,
                              cep: e.target.value
                            })
                          }
                          placeholder="Digite o CEP"
                          maxLength={9}
                          disabled={buscandoCep}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                        />

                        <button
                          type="button"
                          onClick={buscarCep}
                          disabled={buscandoCep}
                          className="px-4 md:px-5 py-3 bg-[#0E5617] text-white rounded-xl hover:bg-[#0B4312] transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {buscandoCep
                            ? "Buscando..."
                            : "Buscar"}
                        </button>

                      </div>
                    </div>

                    {/* LOGRADOURO / NÚMERO */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">
                          Logradouro
                        </label>

                        <input
                          type="text"
                          value={enderecoForm.logradouro}
                          onChange={(e) =>
                            setEnderecoForm({
                              ...enderecoForm,
                              logradouro: e.target.value
                            })
                          }
                          placeholder="Rua, avenida..."
                          className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Número
                        </label>

                        <input
                          type="text"
                          value={enderecoForm.numero}
                          onChange={(e) =>
                            setEnderecoForm({
                              ...enderecoForm,
                              numero: e.target.value
                            })
                          }
                          placeholder="Nº"
                          className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                    </div>

                    {/* BAIRRO */}

                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Bairro
                      </label>

                      <input
                        type="text"
                        value={enderecoForm.bairro}
                        onChange={(e) =>
                          setEnderecoForm({
                            ...enderecoForm,
                            bairro: e.target.value
                          })
                        }
                        placeholder="Digite o bairro"
                        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* CIDADE / UF */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">
                          Cidade
                        </label>

                        <input
                          type="text"
                          value={enderecoForm.cidade}
                          onChange={(e) =>
                            setEnderecoForm({
                              ...enderecoForm,
                              cidade: e.target.value
                            })
                          }
                          placeholder="Digite a cidade"
                          className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          UF
                        </label>

                        <input
                          type="text"
                          value={enderecoForm.uf}
                          onChange={(e) =>
                            setEnderecoForm({
                              ...enderecoForm,
                              uf: e.target.value.toUpperCase()
                            })
                          }
                          placeholder="SP"
                          maxLength={2}
                          className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
                        />
                      </div>

                    </div>

                    {/* COMPLEMENTO */}

                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Complemento
                      </label>

                      <input
                        type="text"
                        value={enderecoForm.complemento}
                        onChange={(e) =>
                          setEnderecoForm({
                            ...enderecoForm,
                            complemento: e.target.value
                          })
                        }
                        placeholder="Apartamento, bloco, referência..."
                        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* MENSAGEM ENDEREÇO */}

                    {mensagemEndereco && (
                      <div
                        className={`p-3 rounded-xl text-sm ${
                          mensagemEndereco.tipo === "sucesso"
                            ? "bg-green-50 text-green-800 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        {mensagemEndereco.texto}
                      </div>
                    )}

                    {/* AÇÕES */}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">

                      <button
                        type="button"
                        onClick={cancelarEdicaoEndereco}
                        disabled={salvandoEndereco}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={salvarEndereco}
                        disabled={
                          salvandoEndereco ||
                          usandoLocalizacao
                        }
                        className="px-4 py-2.5 rounded-xl bg-[#0E5617] text-white hover:bg-[#0B4312] transition disabled:opacity-50"
                      >
                        {usandoLocalizacao
                          ? "Obtendo localização..."
                          : salvandoEndereco
                          ? "Salvando..."
                          : "Salvar endereço"}
                      </button>

                    </div>

                  </div>
                )}

              </div>

              {/* MENSAGEM PERFIL */}

              {mensagemPerfil && (
                <div
                  className={`p-3 rounded-xl text-sm ${
                    mensagemPerfil.tipo === "sucesso"
                      ? "bg-green-50 text-green-800 border border-green-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  {mensagemPerfil.texto}
                </div>
              )}

              {/* SAIR */}

              <div className="border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() => {
                    const confirmar = window.confirm(
                      "Tem certeza que deseja sair da sua conta?"
                    );

                    if (confirmar) {
                      logout();
                      navigate("/login");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
                >
                  <FaSignOutAlt />
                  Sair da conta
                </button>

              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            MEUS PETS
        ====================================================== */}

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="p-5 md:p-6 border-b border-gray-100">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-green-50 text-[#0E5617] flex items-center justify-center">
                  <FaPaw />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Meus pets
                  </h2>

                  <p className="text-sm text-gray-500">
                    Cadastre seus pets para facilitar seus atendimentos.
                  </p>
                </div>

              </div>

              <span className="hidden sm:block text-sm font-semibold text-gray-400">
                {pets.length}{" "}
                {pets.length === 1 ? "pet" : "pets"}
              </span>

            </div>

          </div>

          <div className="p-5 md:p-6">

            {loadingPets ? (
              <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 border-green-100 border-t-[#0E5617] rounded-full animate-spin mx-auto mb-3" />

                <p className="text-sm text-gray-500">
                  Carregando pets...
                </p>
              </div>
            ) : pets.length === 0 ? (
              <div className="py-8 text-center">

                <div className="w-16 h-16 rounded-full bg-green-50 text-[#0E5617] flex items-center justify-center mx-auto mb-4">
                  <FaPaw className="text-2xl" />
                </div>

                <h3 className="font-bold text-gray-800">
                  Nenhum pet cadastrado
                </h3>

                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Cadastre seu pet para manter os dados dele organizados
                  e facilitar futuros atendimentos.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="relative bg-gradient-to-br from-green-50 to-green-100 border border-green-100 rounded-2xl p-4 overflow-hidden"
                  >

                    <div className="flex gap-4">

                      <img
                        src={
                          pet.imagem
                            ? `${API_URL}${pet.imagem}`
                            : "/banners/pet-padrao.jpg"
                        }
                        alt={pet.nome}
                        className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0 pr-10">

                        <h3 className="text-lg font-bold text-[#0E5617] truncate">
                          {pet.nome}
                        </h3>

                        <div className="space-y-1 mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">
                              Raça:
                            </span>{" "}
                            {pet.raca || "Não informada"}
                          </p>

                          <p>
                            <span className="font-medium">
                              Idade:
                            </span>{" "}
                            {pet.idade || "Não informada"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* AÇÕES */}

                    <div className="absolute top-3 right-3 flex gap-2">

                      <button
                        type="button"
                        className="w-9 h-9 bg-white rounded-lg text-[#0E5617] shadow-sm hover:bg-green-50 transition flex items-center justify-center"
                        onClick={() => {
                          setPetParaEditar(pet);
                          setShowModalPet(true);
                        }}
                        aria-label={`Editar ${pet.nome}`}
                      >
                        <FaPen className="text-sm" />
                      </button>

                      <button
                        type="button"
                        className="w-9 h-9 bg-white rounded-lg text-red-500 shadow-sm hover:bg-red-50 transition flex items-center justify-center"
                        onClick={() => removerPet(pet.id)}
                        aria-label={`Remover ${pet.nome}`}
                      >
                        <FaTrash className="text-sm" />
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

            {/* ADICIONAR PET */}

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800"
              onClick={() => {
                console.log("CLIQUEI EM ADICIONAR PET");
                setPetParaEditar(null);
                setShowModalPet(true);
              }}
            >
              <FaPlus />
              Adicionar Pet
            </button>

          </div>

        </section>

      </main>

      {showModalPet && (
        <PetModal
          token={token}
          petExistente={petParaEditar}
          onClose={() => {
            setShowModalPet(false);
            setPetParaEditar(null);
          }}
          onPetSalvo={() => {
            carregarPets();
          }}
        />
      )}
              
      <Footer />
    </div>
  );
}
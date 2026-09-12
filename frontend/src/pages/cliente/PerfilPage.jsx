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
  FaMapMarkerAlt
} from "react-icons/fa";
import PetModal from "../../components/modals/PetModal";

import petService from "../../services/petService";
import api from "../../services/api";

export default function PerfilPage() {
  const {
    usuario,
    token,
    logout,
    atualizarUsuario
  } = useAuth();

  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [showUserData, setShowUserData] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [showModalPet, setShowModalPet] = useState(false);
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

  const navigate = useNavigate();

  // Pet que será editado
  const [petParaEditar, setPetParaEditar] = useState(null);

  // --- FUNÇÃO ISOLADA PARA RECARREGAR PETS ---
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

  useEffect(() => {
    if (!token) return;

    async function carregarPerfil() {
      try {
        const { data } = await api.get("/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        atualizarUsuario(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    }

    carregarPerfil();
  }, [token]);

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
        reject(new Error("Geolocalização não é suportada neste dispositivo."));
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
        texto: "Informe CEP, endereço, número, bairro, cidade e UF válidos."
      });
      return;
    }

    setSalvandoEndereco(true);
    setMensagemEndereco(null);

    try {
      /*
      * Primeiro tenta salvar normalmente.
      * O backend fará o geocoding pelo Nominatim.
      */
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

      /*
      * Se o backend não conseguiu localizar o endereço,
      * oferecemos o GPS como alternativa.
      */
      const mensagemBackend = err.response?.data?.mensagem || "";

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

        atualizarUsuario(data.usuario || dadosComLocalizacao);

        setMensagemEndereco({
          tipo: "sucesso",
          texto: "Endereço atualizado usando sua localização atual."
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

  // --- INICIAR EDIÇÃO DE CAMPO ---
  function iniciarEdicao(campo) {
    setMensagemPerfil(null);
    setCampoEditando(campo);
    setValorEditando(usuario[campo] || "");
  }

  // --- CANCELAR EDIÇÃO ---
  function cancelarEdicao() {
    setCampoEditando(null);
    setValorEditando("");
    setMensagemPerfil(null);
  }

  // --- SALVAR CAMPO DO PERFIL ---
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

  // --- REMOVER PET ---
  async function removerPet(id) {
    if (!confirm("Deseja realmente remover este pet?")) return;

    try {
      await petService.deletar(id, token);

      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Erro ao remover pet.");
      console.log(err);
    }
  }

  if (!usuario) {
    return (
      <p className="text-center mt-10">
        Usuário não logado.
      </p>
    );
  }

  const camposPerfil = [
    {
      campo: "nome",
      icon: <FaUser className="text-green-700" />,
      label: "Nome"
    },
    {
      campo: "email",
      icon: <FaEnvelope className="text-green-700" />,
      label: "E-mail",
      bloqueado: true
    },
    {
      campo: "telefone",
      icon: <FaPhone className="text-green-700" />,
      label: "Telefone"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* CABEÇALHO */}
      <header className="relative bg-gradient-to-r from-green-200 to-green-300 shadow-md rounded-b-3xl p-6 flex items-center justify-between z-20">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-green-900">
            Olá, {usuario.nome}!
          </h1>

          <p className="text-green-800 text-sm mt-1">
            Bem-vindo de volta!
          </p>
        </div>

        <button
          type="button"
          aria-label="Configurações da conta"
          className="p-3 bg-green-900 text-white rounded-full hover:bg-green-800 transition-transform duration-300"
          onClick={() => {
            setShowUserData(!showUserData);

            if (showUserData) {
              cancelarEdicao();
              cancelarEdicaoEndereco();
            }
          }}
        >
          <FaCog
            className={`transition-transform duration-300 ${
              showUserData ? "rotate-90" : ""
            }`}
          />
        </button>
      </header>

      {/* DADOS DO USUÁRIO */}
      <section
        className={`
          relative z-10 bg-white overflow-hidden
          transition-all duration-300 ease-out
          ${
            showUserData
              ? "max-h-[1000px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2"
          }
        `}
      >
        <div className="p-4 border-x border-b border-green-100 shadow-md rounded-b-2xl">

          <div className="space-y-2">

            {camposPerfil.map((item) => {
              const estaEditando = campoEditando === item.campo;

              const valorExibido =
                usuario[item.campo] || "Não informado";

              return (
                <div
                  key={item.campo}
                  className="p-2 rounded hover:bg-green-50 transition"
                >
                  {!estaEditando ? (
                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2 min-w-0">
                        {item.icon}

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-gray-500">
                            {item.label}
                          </span>

                          <span className="truncate">
                            {valorExibido}
                          </span>
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
                          className="p-2 text-green-700 hover:text-green-900 transition"
                          aria-label={`Editar ${item.label}`}
                        >
                          <FaPen />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">

                      <div className="flex items-center gap-2">
                        {item.icon}

                        <span className="text-xs text-gray-500">
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
                          setValorEditando(e.target.value)
                        }
                        autoFocus
                        maxLength={
                          item.campo === "uf" ? 2 : undefined
                        }
                        className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Digite seu ${item.label.toLowerCase()}`}
                      />

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={cancelarEdicao}
                          disabled={salvandoPerfil}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          onClick={salvarCampo}
                          disabled={salvandoPerfil}
                          className="px-3 py-1.5 rounded-lg bg-green-900 text-white hover:bg-green-800 transition disabled:opacity-50"
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

          {/* Endereço */}
          <div className="mt-4 pt-4 border-t border-green-100">

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-700" />

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">
                    Endereço
                  </span>

                  <span className="font-medium">
                    {usuario.logradouro
                      ? `${usuario.logradouro}, ${usuario.numero || "S/N"}`
                      : "Endereço não informado"}
                  </span>
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
                className="p-2 text-green-700 hover:text-green-900 transition"
                aria-label="Editar endereço"
              >
                <FaPen />
              </button>
            </div>

            {!editandoEndereco ? (
              <div className="text-sm text-gray-600 space-y-1 pl-7">
                {usuario.bairro && (
                  <p>
                    Bairro: {usuario.bairro}
                  </p>
                )}

                {usuario.cidade && (
                  <p>
                    Cidade: {usuario.cidade}{" "}
                    {usuario.uf ? `- ${usuario.uf}` : ""}
                  </p>
                )}

                {usuario.cep && (
                  <p>
                    CEP: {usuario.cep}
                  </p>
                )}

                {usuario.complemento && (
                  <p>
                    Complemento: {usuario.complemento}
                  </p>
                )}

                {usuario.latitude && usuario.longitude && (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Localização definida
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">

                <div>
                  <label className="text-xs text-gray-500">
                    CEP
                  </label>

                  <div className="flex gap-2">
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
                      className="flex-1 px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={buscarCep}
                      disabled={buscandoCep}
                      className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50"
                    >
                      {buscandoCep ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">
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
                      className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
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
                      className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-xs text-gray-500">
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
                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">
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
                      className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
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
                      className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 uppercase"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-xs text-gray-500">
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
                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {mensagemEndereco && (
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      mensagemEndereco.tipo === "sucesso"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {mensagemEndereco.texto}
                  </div>
                )}

                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={cancelarEdicaoEndereco}
                    disabled={salvandoEndereco}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={salvarEndereco}
                    disabled={salvandoEndereco}
                    className="px-3 py-1.5 rounded-lg bg-green-900 text-white hover:bg-green-800 transition disabled:opacity-50"
                  >
                    {salvandoEndereco
                      ? "Salvando..."
                      : "Salvar endereço"}
                  </button>

                </div>

              </div>
            )}

          </div>

          {/* MENSAGEM */}
          {mensagemPerfil && (
            <div
              className={`mt-3 p-2 rounded-lg text-sm ${
                mensagemPerfil.tipo === "sucesso"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {mensagemPerfil.texto}
            </div>
          )}

          {/* SAIR */}
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
            className="w-full flex items-center gap-2 p-2 mt-3 rounded hover:bg-red-50 text-red-600 font-semibold transition"
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>
      </section>

      {/* BOTÕES: FAVORITOS / MEUS AGENDAMENTOS / HISTÓRICO */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-2">

        <button
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold bg-white text-green-900 border-green-900 hover:bg-green-900 hover:text-white transition"
          onClick={() => navigate("/favoritos")}
        >
          <FaHeart />
          Favoritos
        </button>

        <button
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold bg-white text-green-900 border-green-900 hover:bg-green-900 hover:text-white transition"
          onClick={() => navigate("/meus-agendamentos")}
        >
          <FaCalendarAlt />
          Agendamentos
        </button>

        <button
          className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold bg-white text-green-900 border-green-900 hover:bg-green-900 hover:text-white transition"
          onClick={() => navigate("/meus-pedidos")}
        >
          <FaPaw />
          Meus Pedidos
        </button>

      </div>

      {/* MODAL DE PET */}
      {showModalPet && (
        <PetModal
          token={token}
          petExistente={petParaEditar}
          onClose={() => {
            setShowModalPet(false);
            setPetParaEditar(null);
          }}
          onPetSalvo={() => carregarPets()}
        />
      )}

      {/* LISTA DE PETS */}
      <section className="space-y-4 p-4">

        {loadingPets ? (
          <p className="text-center mt-10">
            Carregando pets...
          </p>
        ) : pets.length === 0 ? (
          <p className="text-gray-600">
            Você ainda não cadastrou nenhum pet.
          </p>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              className="flex gap-4 p-4 rounded-xl shadow-lg overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg, #A7F3D0, #047857)"
              }}
            >
              <img
                src={
                  pet.imagem
                    ? `http://localhost:3000${pet.imagem}`
                    : "/banners/pet-padrao.jpg"
                }
                alt={pet.nome}
                className="w-32 h-32 rounded-xl object-cover"
              />

              <div className="flex-1 text-white flex flex-col justify-center gap-1">
                <h3 className="text-xl font-bold">
                  {pet.nome}
                </h3>

                <p>
                  Raça: {pet.raca || "Não informada"}
                </p>

                <p>
                  Idade: {pet.idade || "Não informada"}
                </p>
              </div>

              {/* BOTÕES */}
              <div className="flex flex-col gap-2 absolute top-2 right-2">

                {/* EDITAR */}
                <button
                  className="p-1 bg-white rounded-full text-green-900 hover:bg-green-200 transition"
                  onClick={() => {
                    setPetParaEditar(pet);
                    setShowModalPet(true);
                  }}
                >
                  <FaPen />
                </button>

                {/* REMOVER */}
                <button
                  className="p-1 bg-white rounded-full text-red-600 hover:bg-red-200 transition"
                  onClick={() => removerPet(pet.id)}
                >
                  <FaTrash />
                </button>

              </div>
            </div>
          ))
        )}

      </section>

      {/* BOTÃO ADICIONAR PET */}
      <div className="px-4 mt-5">

        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800"
          onClick={() => {
            setPetParaEditar(null);
            setShowModalPet(true);
          }}
        >
          <FaPlus />
          Adicionar Pet
        </button>

      </div>
    </div>
  );
}

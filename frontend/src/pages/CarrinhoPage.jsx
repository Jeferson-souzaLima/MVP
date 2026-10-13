import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ShoppingBag,
  Store,
  Truck,
  MapPin,
  LocateFixed,
  User,
  Phone,
  CreditCard,
  Check,
  Pencil,
  Search,
  Save,
} from "lucide-react";

import { useCarrinho } from "../context/CarrinhoContext";
import { useAuth } from "../hooks/useAuth";
import { Footer } from "../components/layout/Footer";
import CarrinhoItem from "../components/cards/CarrinhoItem";
import api from "../services/api";

export default function CarrinhoPage() {
  const navigate = useNavigate();

  const {
    carrinho,
    aumentarQuantidade,
    diminuirQuantidade,
    removerItem,
  } = useCarrinho();

  const { usuario, token, atualizarUsuario } = useAuth();

  const [retirada, setRetirada] = useState("retirada");

  const [contato, setContato] = useState({
    nome: usuario?.nome || "",
    telefone: usuario?.telefone || "",
  });

  const [endereco, setEndereco] = useState({
    cep: usuario?.cep || "",
    logradouro: usuario?.logradouro || "",
    numero: usuario?.numero || "",
    complemento: usuario?.complemento || "",
    bairro: usuario?.bairro || "",
    cidade: usuario?.cidade || "",
    uf: usuario?.uf || "",
  });

  const [coordenadasEntrega, setCoordenadasEntrega] = useState(
    usuario?.latitude && usuario?.longitude
      ? {
          latitude: Number(usuario.latitude),
          longitude: Number(usuario.longitude),
        }
      : null
  );

  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [salvarNoPerfil, setSalvarNoPerfil] = useState(false);

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [usandoLocalizacao, setUsandoLocalizacao] = useState(false);
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState("");

  const [erro, setErro] = useState("");
  const [erroEndereco, setErroEndereco] = useState("");

  const [frete, setFrete] = useState(0);
  const [distanciaEntrega, setDistanciaEntrega] = useState(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);

  const [finalizando, setFinalizando] = useState(false);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);

  /*
   * Carrega os dados mais recentes do perfil.
   */
  useEffect(() => {
    if (!token) return;

    let ativo = true;

    async function carregarPerfil() {
      try {
        const { data } = await api.get("/usuarios/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ativo) return;

        const perfil = data.usuario || data;

        atualizarUsuario(perfil);

        setContato({
          nome: perfil.nome || "",
          telefone: perfil.telefone || "",
        });

        setEndereco({
          cep: perfil.cep || "",
          logradouro: perfil.logradouro || "",
          numero: perfil.numero || "",
          complemento: perfil.complemento || "",
          bairro: perfil.bairro || "",
          cidade: perfil.cidade || "",
          uf: perfil.uf || "",
        });

        if (perfil.latitude && perfil.longitude) {
          setCoordenadasEntrega({
            latitude: Number(perfil.latitude),
            longitude: Number(perfil.longitude),
          });
        }
      } catch {
        /*
         * Se o perfil não puder ser carregado, o checkout continua
         * funcionando com os dados que eventualmente já existam.
         */
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [token, atualizarUsuario]);

  /*
   * Verifica se existe um endereço completo salvo no perfil.
   */
  const possuiEnderecoPerfil = Boolean(
    usuario?.cep &&
      usuario?.logradouro &&
      usuario?.numero &&
      usuario?.bairro &&
      usuario?.cidade &&
      usuario?.uf
  );

  /*
   * Quantidade total de itens.
   */
  const quantidadeItens = carrinho.itens.reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
  );

  /*
   * Nome da loja do carrinho.
   */
  const nomeLoja = carrinho.itens[0]?.loja_nome || "Loja selecionada";

  /*
   * Total.
   */
  const totalFormatado = Number(carrinho.total || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  const totalComFrete =  Number(carrinho.total || 0) +  (retirada === "entrega" ? Number(frete || 0) : 0);

  const totalComFreteFormatado = totalComFrete.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  /*
   * Formas de retirada.
   */
  const retiradas = [
    {
      id: "retirada",
      nome: "Retirar na loja",
      descricao: "Você busca o pedido na loja.",
      icon: Store,
    },
    {
      id: "entrega",
      nome: "Receber em casa",
      descricao: "Calcularemos a entrega para seu endereço.",
      icon: Truck,
    },
  ];

  /*
   * Normaliza endereço antes de enviar.
   */
  function normalizarEndereco() {
    return {
      ...endereco,
      cep: endereco.cep.replace(/\D/g, ""),
      logradouro: endereco.logradouro.trim(),
      numero: endereco.numero.trim(),
      complemento: endereco.complemento.trim(),
      bairro: endereco.bairro.trim(),
      cidade: endereco.cidade.trim(),
      uf: endereco.uf.trim().toUpperCase(),
    };
  }

  /*
   * Validação do endereço.
   */
  function validarEndereco() {
    const enderecoNormalizado = normalizarEndereco();

    if (!/^\d{8}$/.test(enderecoNormalizado.cep)) {
      setErroEndereco("Informe um CEP válido.");
      return false;
    }

    if (!enderecoNormalizado.logradouro) {
      setErroEndereco("Informe o endereço.");
      return false;
    }

    if (!enderecoNormalizado.numero) {
      setErroEndereco("Informe o número.");
      return false;
    }

    if (!enderecoNormalizado.bairro) {
      setErroEndereco("Informe o bairro.");
      return false;
    }

    if (!enderecoNormalizado.cidade) {
      setErroEndereco("Informe a cidade.");
      return false;
    }

    if (!/^[A-Z]{2}$/.test(enderecoNormalizado.uf)) {
      setErroEndereco("Informe uma UF válida.");
      return false;
    }

    setErroEndereco("");

    return true;
  }

  /*
   * Busca endereço pelo CEP usando o endpoint já existente.
   */
  async function buscarCep() {
    const cep = endereco.cep.replace(/\D/g, "");

    if (!/^\d{8}$/.test(cep)) {
      setErroEndereco("Informe um CEP válido para realizar a busca.");
      return;
    }

    setBuscandoCep(true);
    setErroEndereco("");

    try {
      const { data } = await api.get(`/cep/${cep}`);

      setEndereco((prev) => ({
        ...prev,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        uf: data.uf || "",
      }));
    } catch {
      setErroEndereco(
        "Não foi possível localizar esse CEP. Confira o número e tente novamente."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  /*
   * Obtém a localização atual do navegador.
   */
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
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /*
   * Usa a localização atual para esta entrega.
   */
  async function usarLocalizacaoAtual() {
    setUsandoLocalizacao(true);
    setErro("");
    setMensagemLocalizacao("");

    try {
      const coordenadas = await obterLocalizacaoAtual();

      setCoordenadasEntrega(coordenadas);

      setMensagemLocalizacao(
        "Localização atual definida para esta entrega."
      );
    } catch {
      setErro(
        "Não foi possível obter sua localização. Permita o acesso à localização no navegador."
      );
    } finally {
      setUsandoLocalizacao(false);
    }
  }

  /*
   * Salva o endereço no perfil quando o usuário optar por isso.
   */
  async function aplicarEndereco() {
    setErro("");
    setErroEndereco("");

    if (!validarEndereco()) return;

    const enderecoNormalizado = normalizarEndereco();

    if (salvarNoPerfil) {
      setSalvandoEndereco(true);

      try {
        const dadosParaSalvar = {
          ...enderecoNormalizado,
          ...(coordenadasEntrega
            ? {
                latitude: coordenadasEntrega.latitude,
                longitude: coordenadasEntrega.longitude,
              }
            : {}),
        };

        const { data } = await api.put(
          "/usuarios/me",
          dadosParaSalvar,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        atualizarUsuario(
          data.usuario || data || dadosParaSalvar
        );
      } catch (requestError) {
        setErro(
          requestError.response?.data?.mensagem ||
            "Não foi possível salvar o endereço no seu perfil."
        );

        setSalvandoEndereco(false);
        return;
      }

      setSalvandoEndereco(false);
    }

    setEditandoEndereco(false);
    setMensagemLocalizacao("");
  }

  async function calcularFreteEntrega() {
    if (
        retirada !== "entrega" ||
        !carrinho.loja_id ||
        !coordenadasEntrega?.latitude ||
        !coordenadasEntrega?.longitude
    ) {
        setFrete(0);
        setDistanciaEntrega(null);
        return;
    }

    try {
        setCalculandoFrete(true);

        const { data } = await api.post("/pedidos/calcular-frete", {
            loja_id: carrinho.loja_id,
            latitude: coordenadasEntrega.latitude,
            longitude: coordenadasEntrega.longitude
        });

        setFrete(Number(data.frete || 0));
        setDistanciaEntrega(
            data.distancia_km != null
                ? Number(data.distancia_km)
                : null
        );

    } catch (erro) {
        console.error("Erro ao calcular frete:", erro);

        setFrete(0);
        setDistanciaEntrega(null);

    } finally {
        setCalculandoFrete(false);
    }
  }

  useEffect(() => {
    calcularFreteEntrega();
  }, [
      retirada,
      carrinho.loja_id,
      coordenadasEntrega?.latitude,
      coordenadasEntrega?.longitude
  ]);

  /*
   * Encerra o checkout.
   */
  async function finalizarPedido() {
    setErro("");

    if (!contato.nome.trim()) {
      setErro("Informe seu nome para contato.");
      return;
    }

    if (!contato.telefone.trim()) {
      setErro("Informe seu telefone para contato.");
      return;
    }

    let enderecoComCoordenadas = normalizarEndereco();

    if (retirada === "entrega") {
      if (!validarEndereco()) {
        setErro(erroEndereco || "Preencha corretamente o endereço.");
        return;
      }

      /*
       * Se já temos coordenadas do perfil ou obtidas manualmente,
       * reutilizamos.
       *
       * Caso contrário, tentamos obter a localização automaticamente.
       */
      let coordenadas = coordenadasEntrega;

      if (!coordenadas) {
        try {
          coordenadas = await obterLocalizacaoAtual();

          setCoordenadasEntrega(coordenadas);
        } catch {
          setErro(
            "Permita o acesso à localização para calcular a entrega."
          );
          return;
        }
      }

      enderecoComCoordenadas = {
        ...enderecoComCoordenadas,
        ...coordenadas,
      };
    }

    setFinalizando(true);

    try {
      const resposta = await api.post("/pedidos/checkout", {
        loja_id: carrinho.loja_id,

        itens: carrinho.itens.map((item) => ({
          produto_id: item.item_id,
          quantidade: item.quantidade,
        })),

        modalidade_entrega: retirada,

        contato,

        endereco: enderecoComCoordenadas,
      });

      window.location.assign(resposta.data.checkout_url);
    } catch (requestError) {
      setErro(
        requestError.response?.data?.mensagem ||
          "Não foi possível iniciar o pagamento."
      );

      setFinalizando(false);
    }
  }

  /*
   * Carrinho vazio.
   */
  if (!carrinho.itens.length) {
    return (
      <div className="bg-[#EBE9E9] min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-[#0E5617]" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-800">
              Seu carrinho está vazio
            </h1>

            <p className="mt-2 text-gray-600 leading-relaxed">
              Encontre produtos para o seu pet e adicione ao carrinho
              para começar sua compra.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                mt-6
                w-full
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0E5617]
                text-white
                font-semibold
                py-3.5
                px-5
                shadow-md
                hover:bg-[#0b4612]
                hover:shadow-lg
                active:scale-[0.99]
                transition-all
              "
            >
              <ShoppingBag className="w-5 h-5" />
              Explorar produtos
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#EBE9E9] min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">

          {/* CABEÇALHO */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#0E5617]" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Seu carrinho
                </h1>

                <p className="text-sm text-gray-600">
                  {quantidadeItens}{" "}
                  {quantidadeItens === 1 ? "item" : "itens"} ·{" "}
                  {nomeLoja}
                </p>
              </div>
            </div>
          </div>

          {/* ITENS */}
          <section>
            <div className="space-y-4">
              {carrinho.itens.map((item) => (
                <CarrinhoItem
                  key={item.item_id}
                  item={item}
                  onIncrease={() =>
                    aumentarQuantidade(item.item_id)
                  }
                  onDecrease={() =>
                    diminuirQuantidade(item.item_id)
                  }
                  onRemove={() =>
                    removerItem(item.item_id)
                  }
                />
              ))}
            </div>
          </section>

          {/* FORMA DE RETIRADA */}
          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Como você quer receber?
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {retiradas.map((opcao) => {
                const Icon = opcao.icon;
                const selecionada = retirada === opcao.id;

                return (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => {
                      setRetirada(opcao.id);
                      setErro("");
                    }}
                    className={`
                      relative
                      text-left
                      rounded-2xl
                      border
                      p-4
                      transition-all
                      ${
                        selecionada
                          ? "border-green-700 bg-green-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
                      }
                    `}
                  >
                    {selecionada && (
                      <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0E5617] text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          ${
                            selecionada
                              ? "bg-white text-[#0E5617]"
                              : "bg-gray-50 text-gray-600"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="pr-7">
                        <p
                          className={`font-semibold ${
                            selecionada
                              ? "text-[#0E5617]"
                              : "text-gray-800"
                          }`}
                        >
                          {opcao.nome}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {opcao.descricao}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* CONTATO */}
          <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <User className="w-5 h-5 text-[#0E5617]" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Dados para contato
                </h2>

                <p className="text-sm text-gray-500">
                  Usaremos esses dados para falar sobre o pedido.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Nome

                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    value={contato.nome}
                    onChange={(e) =>
                      setContato({
                        ...contato,
                        nome: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </label>

              <label className="text-sm font-semibold text-gray-700">
                Telefone

                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="tel"
                    value={contato.telefone}
                    onChange={(e) =>
                      setContato({
                        ...contato,
                        telefone: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </label>
            </div>
          </section>

          {/* ENDEREÇO */}
          {retirada === "entrega" && (
            <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0E5617]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-800">
                      Endereço de entrega
                    </h2>

                    <p className="text-sm text-gray-500">
                      Para onde devemos enviar seu pedido?
                    </p>
                  </div>
                </div>

                {possuiEnderecoPerfil && !editandoEndereco && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoEndereco(true);
                      setSalvarNoPerfil(true);
                      setErroEndereco("");
                    }}
                    className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[#0E5617] hover:underline"
                  >
                    <Pencil className="w-4 h-4" />
                    Alterar
                  </button>
                )}
              </div>

              {/* ENDEREÇO SALVO */}
              {possuiEnderecoPerfil && !editandoEndereco ? (
                <div className="mt-5">
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#0E5617]" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">
                          Endereço do seu perfil
                        </p>

                        <p className="text-sm text-gray-700 mt-1">
                          {endereco.logradouro}, {endereco.numero}
                          {endereco.complemento
                            ? ` - ${endereco.complemento}`
                            : ""}
                        </p>

                        <p className="text-sm text-gray-600">
                          {endereco.bairro} · {endereco.cidade} -{" "}
                          {endereco.uf}
                        </p>

                        <p className="text-sm text-gray-600">
                          CEP: {endereco.cep}
                        </p>
                      </div>
                    </div>
                  </div>

                  {coordenadasEntrega && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
                      <MapPin className="w-4 h-4" />
                      Localização do endereço disponível para cálculo da
                      entrega.
                    </p>
                  )}

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
                      border
                      border-gray-300
                      bg-white
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
              ) : (
                <>
                  {/* FORMULÁRIO DE ENDEREÇO */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">
                        CEP

                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={9}
                            value={endereco.cep}
                            onChange={(e) =>
                              setEndereco({
                                ...endereco,
                                cep: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                buscarCep();
                              }
                            }}
                            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                          />

                          <button
                            type="button"
                            onClick={buscarCep}
                            disabled={buscandoCep}
                            className="
                              shrink-0
                              flex
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-gray-100
                              px-4
                              py-3
                              text-sm
                              font-semibold
                              text-gray-700
                              hover:bg-gray-200
                              transition
                              disabled:opacity-60
                            "
                          >
                            <Search className="w-4 h-4" />

                            {buscandoCep
                              ? "Buscando..."
                              : "Buscar"}
                          </button>
                        </div>
                      </label>
                    </div>

                    <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                      Endereço

                      <input
                        type="text"
                        value={endereco.logradouro}
                        onChange={(e) =>
                          setEndereco({
                            ...endereco,
                            logradouro: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>

                    <label className="text-sm font-semibold text-gray-700">
                      Número

                      <input
                        type="text"
                        value={endereco.numero}
                        onChange={(e) =>
                          setEndereco({
                            ...endereco,
                            numero: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>

                    <label className="text-sm font-semibold text-gray-700">
                      Complemento
                      <span className="font-normal text-gray-400">
                        {" "}
                        (opcional)
                      </span>

                      <input
                        type="text"
                        value={endereco.complemento}
                        onChange={(e) =>
                          setEndereco({
                            ...endereco,
                            complemento: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>

                    <label className="text-sm font-semibold text-gray-700">
                      Bairro

                      <input
                        type="text"
                        value={endereco.bairro}
                        onChange={(e) =>
                          setEndereco({
                            ...endereco,
                            bairro: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>

                    <label className="text-sm font-semibold text-gray-700">
                      Cidade

                      <input
                        type="text"
                        value={endereco.cidade}
                        onChange={(e) =>
                          setEndereco({
                            ...endereco,
                            cidade: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>

                    <label className="text-sm font-semibold text-gray-700">
                      UF

                      <input
                        type="text"
                        maxLength={2}
                        value={endereco.uf}
                        onChange={(e) =>
                          setEndereco({
                            ...endereco,
                            uf: e.target.value.toUpperCase(),
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 uppercase outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>
                  </div>

                  {erroEndereco && (
                    <p className="mt-3 text-sm text-red-700">
                      {erroEndereco}
                    </p>
                  )}

                  {/* LOCALIZAÇÃO */}
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <LocateFixed className="w-5 h-5 text-[#0E5617] mt-0.5 shrink-0" />

                      <div>
                        <p className="font-semibold text-gray-800">
                          Localização da entrega
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          Podemos usar sua localização atual para calcular
                          a distância da entrega.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={usarLocalizacaoAtual}
                      disabled={usandoLocalizacao}
                      className="
                        mt-3
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

                    {coordenadasEntrega && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
                        <Check className="w-4 h-4" />
                        Localização definida para esta entrega.
                      </p>
                    )}

                    {mensagemLocalizacao && (
                      <p className="mt-2 text-sm text-green-700">
                        {mensagemLocalizacao}
                      </p>
                    )}
                  </div>

                  {/* SALVAR NO PERFIL */}
                  <label className="mt-5 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={salvarNoPerfil}
                      onChange={(e) =>
                        setSalvarNoPerfil(e.target.checked)
                      }
                      className="mt-1 w-4 h-4 accent-green-700"
                    />

                    <span>
                      <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                        <Save className="w-4 h-4 text-[#0E5617]" />
                        Salvar este endereço no meu perfil
                      </span>

                      <span className="block text-sm text-gray-500 mt-1">
                        Assim ele ficará preenchido automaticamente nas
                        próximas compras.
                      </span>
                    </span>
                  </label>

                  {/* AÇÕES DO ENDEREÇO */}
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={aplicarEndereco}
                      disabled={salvandoEndereco}
                      className="
                        flex-1
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#0E5617]
                        text-white
                        font-semibold
                        py-3
                        px-5
                        hover:bg-[#0b4612]
                        transition
                        disabled:opacity-60
                      "
                    >
                      {salvandoEndereco ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Usar este endereço
                        </>
                      )}
                    </button>

                    {possuiEnderecoPerfil && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoEndereco(false);
                          setErroEndereco("");
                          setSalvarNoPerfil(false);

                          setEndereco({
                            cep: usuario?.cep || "",
                            logradouro: usuario?.logradouro || "",
                            numero: usuario?.numero || "",
                            complemento:
                              usuario?.complemento || "",
                            bairro: usuario?.bairro || "",
                            cidade: usuario?.cidade || "",
                            uf: usuario?.uf || "",
                          });
                        }}
                        className="
                          rounded-xl
                          border
                          border-gray-300
                          bg-white
                          px-5
                          py-3
                          font-semibold
                          text-gray-700
                          hover:bg-gray-50
                          transition
                        "
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {/* PAGAMENTO */}
          <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#0E5617]" />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Pagamento
                </h2>

                <p className="text-sm text-gray-500">
                  Pagamento seguro pelo Mercado Pago.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Você escolherá <strong>Pix ou cartão</strong> com
                segurança no Checkout do Mercado Pago.
              </p>
            </div>
          </section>

          {/* RESUMO DO PEDIDO */}
          <section className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Resumo do pedido
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">
                  Total dos produtos
                </span>

                <span className="font-medium text-gray-800">
                  {totalFormatado}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">
                  Frete
                </span>

                <span className="font-medium text-gray-800">
                  {retirada === "retirada" ? (
                    "Retirada na loja"
                  ) : calculandoFrete ? (
                    "Calculando..."
                  ) : (
                    frete.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  )}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-gray-200" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Total
                </p>

                <p className="text-2xl font-bold text-gray-800">
                  {totalComFreteFormatado}
                </p>
              </div>

              <p className="text-xs text-gray-500 text-right">
                {quantidadeItens}{" "}
                {quantidadeItens === 1 ? "item" : "itens"}
              </p>
            </div>

            {erro && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {erro}
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={finalizando}
              onClick={finalizarPedido}
              className="
                mt-5
                w-full
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0E5617]
                text-white
                py-4
                px-5
                font-bold
                shadow-md
                hover:bg-[#0b4612]
                hover:shadow-lg
                active:scale-[0.99]
                transition-all
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {finalizando ? (
                "Preparando pagamento..."
              ) : (
                <>
                  Ir para pagamento
                  <CreditCard className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Você será direcionado ao Checkout Seguro do Mercado Pago.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
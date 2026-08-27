import { FaSearch, FaArrowLeft, FaBookOpen, FaQuestionCircle, FaHeadset, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AjudaSuportePage() {
    const navigate = useNavigate();

    const guias = [
    {
        titulo: "Primeiros Passos",
        descricao: "Aprenda como configurar sua loja e começar a utilizar a plataforma."
    },
    {
        titulo: "Gerenciando Produtos",
        descricao: "Cadastre, edite, organize e remova produtos da sua loja."
    },
    {
        titulo: "Gerenciando Serviços",
        descricao: "Crie, altere e organize os serviços oferecidos aos clientes."
    },
    {
        titulo: "Agenda",
        descricao: "Visualize agendamentos e gerencie seus horários de atendimento."
    },
    {
        titulo: "Dados da Loja",
        descricao: "Atualize informações como telefone, endereço e descrição da loja."
    },
    {
        titulo: "Segurança da Conta",
        descricao: "Altere sua senha e mantenha sua conta protegida."
    }
    ];

    const faq = [
    {
        pergunta: "Como cadastrar um novo produto?",
        resposta:
        "Acesse o menu Produtos e clique em 'Novo Produto'. Preencha as informações obrigatórias e salve o cadastro."
    },
    {
        pergunta: "Posso editar um produto já cadastrado?",
        resposta:
        "Sim. Localize o produto desejado, clique em Editar, faça as alterações necessárias e salve."
    },
    {
        pergunta: "Como cadastrar um serviço?",
        resposta:
        "Acesse o menu Serviços, clique em 'Novo Serviço' e informe nome, descrição, duração e valor."
    },
    {
        pergunta: "Como visualizar meus pedidos?",
        resposta:
        "Os pedidos podem ser consultados na área Pedidos, onde também é possível acompanhar o status de cada solicitação."
    },
    {
        pergunta: "Como atualizar os dados da minha loja?",
        resposta:
        "Acesse Minha Loja para alterar informações como telefone, endereço, descrição e horário de funcionamento."
    },
    {
        pergunta: "Esqueci minha senha. O que devo fazer?",
        resposta:
        "Na tela de login utilize a opção 'Esqueci minha senha' e siga as instruções enviadas para o seu e-mail."
    },
    {
        pergunta: "Como entrar em contato com o suporte?",
        resposta:
        "Utilize as informações disponíveis na seção Contato desta página."
    }
    ];

  return (
    <div className="max-w-6xl mx-auto pb-12">

      {/* ================= HEADER ================= */}
      <header className="bg-gradient-to-r from-green-200 to-green-300 shadow-md rounded-b-3xl p-10 mb-8">

            <button
                type="button"
                onClick={() => navigate("/perfil-lojista")}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-green-900 hover:underline"
            >
                <FaArrowLeft className="text-base" />
                Voltar ao painel
            </button>

            <h1 className="text-3xl font-bold text-green-900">
                Ajuda e Suporte
            </h1>

            <p className="text-green-800 mt-2">
                Encontre respostas para dúvidas frequentes, consulte nossos guias e saiba como entrar em contato com nossa equipe.
            </p>

      </header>

      <div className="space-y-6 px-2">  

        {/* ================= PESQUISA ================= */}
        <section className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-5">
            <FaSearch className="text-green-700 text-xl" />
            <h2 className="text-xl font-semibold text-green-900">
                Pesquisar na Central de Ajuda
            </h2>
            </div>

            <div className="flex gap-3">
            <input
                type="text"
                placeholder="Digite sua dúvida..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button className="bg-green-700 hover:bg-green-800 text-white px-6 rounded-xl transition">
                Pesquisar
            </button>
            </div>
        </section>

        {/* ================= GUIAS ================= */}
        <section className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-5">
                <FaBookOpen className="text-green-700 text-xl" />
                <h2 className="text-xl font-semibold text-green-900">
                    Guias
                </h2>
            </div>

            <div className="space-y-4">
                {guias.map((guia, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                    >
                        <h3 className="font-semibold text-green-900">
                            {guia.titulo}
                        </h3>

                        <p className="text-gray-600 text-sm mt-1">
                            {guia.descricao}
                        </p>
                    </div>
                ))}
            </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-5">
                <FaQuestionCircle className="text-green-700 text-xl" />
                <h2 className="text-xl font-semibold text-green-900">
                    Perguntas Frequentes
                </h2>
            </div>

            <div className="space-y-4">
                {faq.map((item, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                    >
                        <h3 className="font-semibold text-green-900">
                            {item.pergunta}
                        </h3>

                        <p className="text-gray-600 text-sm mt-2">
                            {item.resposta}
                        </p>
                    </div>
                ))}
            </div>
        </section>

        {/* ================= CONTATO ================= */}
        <section className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-5">
                <FaHeadset className="text-green-700 text-xl" />
                <h2 className="text-xl font-semibold text-green-900">
                    Contato
                </h2>
            </div>

            <div className="space-y-5">

                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900">
                        E-mail de Suporte
                    </h3>

                    <p className="text-gray-600 mt-1">
                        contato@petcareconnect.com.br
                    </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900">
                        Horário de Atendimento
                    </h3>

                    <p className="text-gray-600 mt-1">
                        Segunda a Sexta-feira
                        <br />
                        Das 09:00 às 18:00
                    </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900">
                        Tempo Médio de Resposta
                    </h3>

                    <p className="text-gray-600 mt-1">
                        Até 1 dia útil.
                    </p>
                </div>

            </div>
        </section>

        {/* ================= SISTEMA ================= */}
        <section className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-5">
                <FaInfoCircle className="text-green-700 text-xl" />
                <h2 className="text-xl font-semibold text-green-900">
                    Informações do Sistema
                </h2>
            </div>

            <div className="space-y-5">

                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900">
                        Versão
                    </h3>

                    <p className="text-gray-600 mt-1">
                        1.0.0 (MVP)
                    </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900">
                        Status
                    </h3>

                    <p className="text-gray-600 mt-1">
                        Em desenvolvimento.
                    </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900">
                        Última Atualização
                    </h3>

                    <p className="text-gray-600 mt-1">
                        Julho de 2026
                    </p>
                </div>

            </div>
        </section>

        </div>
        </div>
    );
}
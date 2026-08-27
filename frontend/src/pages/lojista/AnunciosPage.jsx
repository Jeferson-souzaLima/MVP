import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AnunciosPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* HEADER */}
      <header className="rounded-b-3xl bg-gradient-to-r from-green-200 to-green-300 p-8 shadow-md sm:p-10">
        <button
          type="button"
          onClick={() => navigate("/perfil-lojista")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-900 hover:underline"
        >
          <FaArrowLeft />
          Voltar ao painel
        </button>

        <h1 className="text-3xl font-bold text-green-900">
          Anúncios
        </h1>

        <p className="mt-2 text-green-800">
          Essa página ainda está em desenvolvimento. Em breve você poderá visualizar e gerenciar todos os seus anúncios, incluindo detalhes sobre produtos, status de publicação e métricas de desempenho.
        </p>
      </header>

    </div>
  );
}
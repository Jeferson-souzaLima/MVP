import { API_URL } from "@/services/apiUrl";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerificarEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("carregando");
  const [mensagem, setMensagem] = useState("Confirmando seu e-mail...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("erro");
      setMensagem("O link de confirmação é inválido.");
      return;
    }

    fetch(`${API_URL}/auth/confirmar-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensagem);
        setStatus("sucesso");
        setMensagem(data.mensagem);
      })
      .catch((error) => {
        setStatus("erro");
        setMensagem(error.message || "Não foi possível confirmar seu e-mail.");
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-green-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-bold text-green-900">Confirmação de e-mail</h1>
        <p className={`mt-4 ${status === "erro" ? "text-red-600" : "text-gray-700"}`}>{mensagem}</p>
        {status !== "carregando" && <button type="button" onClick={() => navigate("/login")} className="mt-6 rounded-xl bg-green-900 px-5 py-3 font-semibold text-white hover:bg-green-800">Ir para o login</button>}
      </div>
    </div>
  );
}

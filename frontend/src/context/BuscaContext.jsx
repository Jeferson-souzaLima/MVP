import { createContext, useEffect, useRef, useState } from "react";
import { buscar } from "../services/buscaService";

export const BuscaContext = createContext();

export function BuscaProvider({ children }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const controllerRef = useRef(null);

    useEffect(() => {
      const termo = busca.trim();

      if (termo.length < 2) {
        controllerRef.current?.abort();
        setResultados(null);
        setLoading(false);
        setDropdownAberto(false);
        return;
      }

      const timer = setTimeout(async () => {
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        try {
          setLoading(true);

          const data = await buscar(termo, controller.signal);

          if (controller.signal.aborted) return;

          setResultados(data);
          setDropdownAberto(true);

        } catch (error) {
          if (
            error.name !== "CanceledError" &&
            error.name !== "AbortError"
          ) {
            console.error("Erro ao buscar:", error);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }, [busca]);

  function fecharBusca() {
    setDropdownAberto(false);
  }

  function limparBusca() {
    controllerRef.current?.abort();

    setBusca("");
    setResultados(null);
    setLoading(false);
    setDropdownAberto(false);
  }

  return (
    <BuscaContext.Provider
      value={{
        busca,
        setBusca,
        resultados,
        loading,
        dropdownAberto,
        fecharBusca,
        limparBusca,
      }}
    >
      {children}
    </BuscaContext.Provider>
  );
}
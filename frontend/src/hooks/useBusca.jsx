import { useContext } from "react";
import { BuscaContext } from "../context/BuscaContext";

export function useBusca() {
  return useContext(BuscaContext);
}
import api from "./api";

export async function buscar(termo, signal) {

    const { data } = await api.get("/busca", {
        params: {
            q: termo
        },
        signal
    });

    return data;
}

export async function buscarResultados(termo, signal) {
    const { data } = await api.get("/busca/resultados", {
        params: {
            q: termo,
        },
        signal,
    });

    return data;
}
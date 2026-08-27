import api from "./api";

// ===============================
// LISTAR FAVORITOS
// ===============================
export async function listarFavoritos() {

    const { data } = await api.get("/favoritos");

    return data;
}

// ===============================
// STATUS DO FAVORITO
// ===============================
export async function verificarFavorito(
    tipo,
    referenciaId
) {

    const { data } = await api.get("/favoritos/status", {
        params: {
            tipo,
            referencia_id: referenciaId,
        },
    });

    return data;
}

// ===============================
// ADICIONAR FAVORITO
// ===============================
export async function adicionarFavorito(
    tipo,
    referenciaId
) {

    const { data } = await api.post("/favoritos", {
        tipo,
        referencia_id: referenciaId,
    });

    return data;
}

// ===============================
// REMOVER FAVORITO
// ===============================
export async function removerFavorito(
    tipo,
    referenciaId
) {

    const { data } = await api.delete("/favoritos", {
        data: {
            tipo,
            referencia_id: referenciaId,
        },
    });

    return data;
}
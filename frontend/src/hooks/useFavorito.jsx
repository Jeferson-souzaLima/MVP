import { useEffect, useState } from "react";

import {
    verificarFavorito,
    adicionarFavorito,
    removerFavorito,
} from "@/services/favoritoService";

export function useFavorito(
    tipo,
    referenciaId
) {

    const [favoritado, setFavoritado] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function carregarStatus() {

            try {

                const data = await verificarFavorito(
                    tipo,
                    referenciaId
                );

                setFavoritado(data.favoritado);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        }

        carregarStatus();

    }, [tipo, referenciaId]);

    

    async function toggleFavorito() {

        console.log({
            favoritado,
            tipo,
            referenciaId,
        });

        try {

            setLoading(true);

            if (favoritado) {

                await removerFavorito(
                    tipo,
                    referenciaId
                );

                setFavoritado(false);

            } else {

                await adicionarFavorito(
                    tipo,
                    referenciaId
                );

                setFavoritado(true);

            }

        } catch (error) {

            console.error("Erro:", error);

            if (error.response) {
                console.log(error.response.data);
            }

        } finally {

            setLoading(false);

        }

    }

    return {

        favoritado,
        loading,
        toggleFavorito,

    };

}
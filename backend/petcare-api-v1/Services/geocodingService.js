const axios = require("axios");

exports.buscarCoordenadas = async ({
    endereco,
    cidade,
    uf,
    cep
}) => {

    console.log("Endereço recebido:", {
        endereco,
        cidade,
        uf,
        cep
    });

    const enderecoCompleto = [
        endereco,
        cidade,
        uf,
        cep,
        "Brasil"
    ]
        .filter(Boolean)
        .join(", ");

    try {

        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: enderecoCompleto,
                    format: "json",
                    limit: 1
                },
                headers: {
                    "User-Agent": "PetCareConnect/1.0"
                }
            }
        );

        if (!response.data.length) {

            return null;

        }

        console.log("Coordenadas encontradas:", response.data[0]);

        return {

            latitude: Number(response.data[0].lat),

            longitude: Number(response.data[0].lon)

        };

    } catch (err) {

        console.error("Erro ao buscar coordenadas:", err.message);

        return null;

    }

};
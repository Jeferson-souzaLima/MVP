import api from "./api";

export async function buscarConteudoPorLocalizacao(
    latitude,
    longitude,
    page = 1,
    limit = 20
) {

    const token = localStorage.getItem("token");

    const response = await api.post(

        "/geolocalizacao",

        {
            latitude,
            longitude
        },

        {
            params: {
                page,
                limit
            },

            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

}
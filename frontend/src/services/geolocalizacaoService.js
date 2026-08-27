import api from "./api";

export async function buscarConteudoPorLocalizacao(
    latitude,
    longitude
) {

    const token = localStorage.getItem("token");

    const response = await api.post(

        "/geolocalizacao",

        {
            latitude,
            longitude
        },

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

}
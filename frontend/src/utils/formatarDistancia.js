export function formatarDistancia(distancia) {

    if (
        distancia === null ||
        distancia === undefined
    ) {
        return "";
    }

    const distanciaNumero = Number(distancia);

    if (Number.isNaN(distanciaNumero)) {
        return "";
    }

    return new Intl.NumberFormat(
        "pt-BR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }
    ).format(distanciaNumero) + " km";

}
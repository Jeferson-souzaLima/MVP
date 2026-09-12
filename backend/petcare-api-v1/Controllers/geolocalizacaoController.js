const geolocalizacaoModel = require("../Models/geolocalizacaoModel");

exports.buscar = (req, res) => {

    const { latitude, longitude } = req.body;

    // ===============================
    // CAMPOS OBRIGATÓRIOS
    // ===============================
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            mensagem: "Latitude e longitude são obrigatórias."
        });
    }

    // ===============================
    // VALIDAR VALORES NUMÉRICOS
    // ===============================
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
            mensagem: "Latitude e longitude inválidas."
        });
    }

    // ===============================
    // BUSCAR LOJAS
    // ===============================
    geolocalizacaoModel.buscarLojas(

    lat,
    lng,

    (err, lojas) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                mensagem: "Erro ao buscar lojas próximas."
            });

        }

        geolocalizacaoModel.buscarProdutos(

            lat,
            lng,

            (err, produtos) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        mensagem: "Erro ao buscar produtos próximos."
                    });

                }

                geolocalizacaoModel.buscarServicos(

                lat,
                lng,

                (err, servicos) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({
                            mensagem: "Erro ao buscar serviços próximos."
                        });

                    }

                    return res.status(200).json({

                        lojas,

                        produtos,

                        servicos

                    });

                }

            );

            }

        );

    }

);

};

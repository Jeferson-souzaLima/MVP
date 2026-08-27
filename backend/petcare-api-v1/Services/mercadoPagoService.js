const {
    MercadoPagoConfig,
    Preference,
    Payment
} = require('mercadopago');
const {
    buildWebhookNotificationUrl
} = require('../utils/mercadoPagoNotificationUrl');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

const MercadoPagoService = {

    criarPreferencia: async ({
        titulo,
        valor,
        referencia_id,
        referencia_externa,
        itens
    }) => {

        const preference = await preferenceClient.create({

            body: {

                items: itens || [
                    {
                        id: String(referencia_id),
                        title: titulo,
                        quantity: 1,
                        currency_id: 'BRL',
                        unit_price: Number(valor)
                    }
                ],

                external_reference: referencia_externa || String(referencia_id),

                notification_url: buildWebhookNotificationUrl(
                    process.env.MP_WEBHOOK_URL
                ),

                back_urls: {
                    success: `${process.env.APP_URL || 'http://localhost:5173'}/pagamento/sucesso`,
                    failure: `${process.env.APP_URL || 'http://localhost:5173'}/pagamento/falha`,
                    pending: `${process.env.APP_URL || 'http://localhost:5173'}/pagamento/pendente`
                },
            }

        });

        return preference;
    },

    buscarPagamento: async (paymentId) => {

        const pagamento = await paymentClient.get({
            id: paymentId
        });

        return pagamento;
    }

};

module.exports = MercadoPagoService;

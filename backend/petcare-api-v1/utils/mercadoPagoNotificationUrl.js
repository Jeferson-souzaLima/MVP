const buildWebhookNotificationUrl = (configuredUrl) => {

    if (!configuredUrl || !String(configuredUrl).trim()) {
        throw new Error('MP_WEBHOOK_URL nao configurada.');
    }

    let url;

    try {
        url = new URL(String(configuredUrl).trim());
    } catch (error) {
        throw new Error('MP_WEBHOOK_URL invalida.');
    }

    // Without this explicit source, Mercado Pago may deliver an IPN, whose
    // x-signature is not verifiable with the Webhooks secret.
    url.searchParams.set('source_news', 'webhooks');

    return url.toString();
};

module.exports = {
    buildWebhookNotificationUrl
};

const {
    WebhookSignatureValidator,
    InvalidWebhookSignatureError
} = require('mercadopago');

const getSingleValue = (value) =>
    Array.isArray(value) ? value[0] : value;

const getSignedDataId = (req) => {

    const dataId = getSingleValue(req.query?.['data.id']);

    if (dataId === undefined || dataId === null || String(dataId).trim() === '') {
        return null;
    }

    return String(dataId);
};

// Mercado Pago requires an alphanumeric data.id from the URL in lowercase
// when it is included in the HMAC manifest. Numeric payment IDs are unchanged.
const getDataIdForSignature = (req) => {

    const dataId = getSignedDataId(req);

    return dataId ? dataId.toLowerCase() : null;
};

const getSignatureManifest = (req) => {

    const dataId = getDataIdForSignature(req);
    const requestId = getSingleValue(req.headers?.['x-request-id']);
    const xSignature = String(
        getSingleValue(req.headers?.['x-signature']) || ''
    );
    const timestamp = xSignature
        .split(',')
        .map(part => part.trim())
        .find(part => part.startsWith('ts='))
        ?.slice(3);
    const parts = [];

    if (dataId) parts.push(`id:${dataId}`);
    if (requestId) parts.push(`request-id:${String(requestId).trim()}`);
    if (timestamp) parts.push(`ts:${timestamp}`);

    return parts.length ? `${parts.join(';')};` : '';
};

const validateWebhookSignature = (req, secret) => {

    if (!secret || !String(secret).trim()) {
        const error = new Error('MP_WEBHOOK_SECRET nao configurado.');
        error.code = 'MP_WEBHOOK_SECRET_MISSING';
        throw error;
    }

    const dataId = getSignedDataId(req);

    if (!dataId) {
        const error = new Error('Parametro data.id ausente na query do webhook.');
        error.code = 'MP_WEBHOOK_DATA_ID_MISSING';
        throw error;
    }

    WebhookSignatureValidator.validate({
        xSignature: req.headers['x-signature'],
        xRequestId: req.headers['x-request-id'],
        // Mercado Pago signs the data.id present in the URL, not the JSON body.
        dataId: dataId.toLowerCase(),
        secret: String(secret).trim()
    });

    return dataId;
};

module.exports = {
    getSignedDataId,
    getDataIdForSignature,
    getSignatureManifest,
    validateWebhookSignature,
    InvalidWebhookSignatureError
};

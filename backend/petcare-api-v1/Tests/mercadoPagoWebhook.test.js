const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const {
    getSignedDataId,
    getDataIdForSignature,
    getSignatureManifest,
    validateWebhookSignature,
    InvalidWebhookSignatureError
} = require('../Utils/mercadoPagoWebhook');

const secret = 'webhook-secret-for-test-only';
const requestId = 'request-123';
const dataIdFromUrl = '987654321';
const timestamp = '1704908010';
const manifest = `id:${dataIdFromUrl};request-id:${requestId};ts:${timestamp};`;
const signature = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

const createRequest = (overrides = {}) => ({
    query: { 'data.id': dataIdFromUrl },
    headers: {
        'x-request-id': requestId,
        'x-signature': `ts=${timestamp},v1=${signature}`
    },
    body: { data: { id: 'value-from-body-is-not-signed' } },
    ...overrides
});

test('validates the Mercado Pago manifest built from data.id in the URL', () => {
    const req = createRequest();

    assert.equal(validateWebhookSignature(req, secret), dataIdFromUrl);
    assert.equal(getSignedDataId(req), dataIdFromUrl);
    assert.equal(getSignatureManifest(req), manifest);
});

test('does not substitute data.id from the JSON body into the signature manifest', () => {
    const req = createRequest({ query: {} });

    assert.throws(
        () => validateWebhookSignature(req, secret),
        error => error.code === 'MP_WEBHOOK_DATA_ID_MISSING'
    );
});

test('rejects a signature that does not match the URL data.id', () => {
    const req = createRequest({ query: { 'data.id': 'different-payment-id' } });

    assert.throws(
        () => validateWebhookSignature(req, secret),
        error => error instanceof InvalidWebhookSignatureError
    );
});

test('lowercases an alphanumeric data.id only for the HMAC manifest', () => {
    const dataId = 'PAYMENT-ABC123';
    const expectedManifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(expectedManifest)
        .digest('hex');
    const req = createRequest({
        query: { 'data.id': dataId },
        headers: {
            'x-request-id': requestId,
            'x-signature': `ts=${timestamp},v1=${expectedSignature}`
        }
    });

    assert.equal(getSignedDataId(req), dataId);
    assert.equal(getDataIdForSignature(req), dataId.toLowerCase());
    assert.equal(getSignatureManifest(req), expectedManifest);
    assert.equal(validateWebhookSignature(req, secret), dataId);
});

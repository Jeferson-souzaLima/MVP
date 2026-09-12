const assert = require('node:assert/strict');
const test = require('node:test');

const {
    buildWebhookNotificationUrl
} = require('../Utils/mercadoPagoNotificationUrl');

test('forces Webhooks when creating a Mercado Pago preference', () => {
    assert.equal(
        buildWebhookNotificationUrl('https://example.com/pagamentos/webhook'),
        'https://example.com/pagamentos/webhook?source_news=webhooks'
    );
});

test('preserves existing query parameters and replaces an IPN source', () => {
    const url = buildWebhookNotificationUrl(
        'https://example.com/pagamentos/webhook?cliente=petcare&source_news=ipn'
    );

    assert.equal(
        url,
        'https://example.com/pagamentos/webhook?cliente=petcare&source_news=webhooks'
    );
});

test('rejects an absent or invalid notification URL', () => {
    assert.throws(() => buildWebhookNotificationUrl(''));
    assert.throws(() => buildWebhookNotificationUrl('not-a-url'));
});

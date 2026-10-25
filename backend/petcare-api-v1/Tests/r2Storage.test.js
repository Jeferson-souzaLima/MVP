const assert = require('node:assert/strict');
const test = require('node:test');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { createR2Storage } = require('../Services/r2Storage');

const env = {
    R2_ACCOUNT_ID: 'account-test',
    R2_ACCESS_KEY_ID: 'access-test',
    R2_SECRET_ACCESS_KEY: 'secret-test',
    R2_BUCKET_NAME: 'bucket-test',
    R2_ENDPOINT: 'https://account-test.r2.example.test',
    R2_PUBLIC_URL: 'https://cdn.example.test/assets/'
};
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);

test('validates R2 configuration without exposing credential values', async () => {
    const storage = createR2Storage({ env: {} });
    await assert.rejects(storage.upload({}), (error) => {
        assert.equal(error.code, 'R2_CONFIG_MISSING');
        assert.match(error.message, /R2_BUCKET_NAME/);
        assert.doesNotMatch(error.message, /secret-test/);
        return true;
    });
});

test('uploads verified PNG data with a unique key, bucket and content type', async () => {
    const sent = [];
    const storage = createR2Storage({ env, client: { send: async (command) => sent.push(command) } });
    const first = await storage.upload({ buffer: png, mimetype: 'image/png', originalname: 'photo.png' });
    const second = await storage.upload({ buffer: png, mimetype: 'image/png', originalname: 'photo.png' });

    assert.notEqual(first.key, second.key);
    assert.match(first.key, /^produtos\/[\da-f-]+\.png$/i);
    assert.equal(first.url, `https://cdn.example.test/assets/${first.key}`);
    assert.ok(sent[0] instanceof PutObjectCommand);
    assert.equal(sent[0].input.Bucket, env.R2_BUCKET_NAME);
    assert.equal(sent[0].input.ContentType, 'image/png');
    assert.equal(sent[0].input.Body, png);
});

test('rejects mismatched MIME or file signatures', async () => {
    const storage = createR2Storage({ env, client: { send: async () => assert.fail('must not upload') } });
    await assert.rejects(storage.upload({ buffer: png, mimetype: 'image/jpeg', originalname: 'photo.jpg' }), { code: 'INVALID_IMAGE_CONTENT' });
});

test('deletes R2 objects and classifies only known R2 and legacy upload paths', async () => {
    const sent = [];
    const storage = createR2Storage({ env, client: { send: async (command) => sent.push(command) } });
    await storage.deleteByKey('produtos/image.jpg');
    assert.ok(sent[0] instanceof DeleteObjectCommand);
    assert.deepEqual(sent[0].input, { Bucket: env.R2_BUCKET_NAME, Key: 'produtos/image.jpg' });
    assert.deepEqual(storage.getStorageTarget('https://cdn.example.test/assets/produtos/image.jpg'), { type: 'r2', key: 'produtos/image.jpg' });
    assert.deepEqual(storage.getStorageTarget('/uploads/old image.jpg'), { type: 'local', filename: 'old image.jpg' });
    assert.equal(storage.getStorageTarget('https://attacker.example/uploads/image.jpg'), null);
    assert.equal(storage.getStorageTarget('/uploads/../../secret'), null);
});

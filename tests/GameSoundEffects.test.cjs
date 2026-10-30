const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../public/js/game-sound-effects.js'), 'utf8');
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const setup = (saved = null) => {
    let time = 10000;
    const played = [];
    const storage = new Map(saved ? [['netguard:sfx:42', JSON.stringify(saved)]] : []);
    const listeners = {};
    const feedback = { textContent: '', dataset: {}, hidden: false, closest: () => null, matches: () => false };
    const prologueText = { textContent: '', hidden: false, closest: () => null, matches: () => false };
    let observe;
    const document = {
        body: {}, visibilityState: 'visible',
        querySelector(selector) { return selector === '[data-game-sfx]' ? { dataset: { userId: '42', soundBase: '/audio/sfx' } } : null; },
        querySelectorAll(selector) { return selector.startsWith('[data-feedback]') ? [feedback] : selector.startsWith('[data-dialogue-text]') ? [prologueText] : []; },
        addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
    };
    class AudioContext {
        constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
        createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {}, disconnect() {} }; }
        createBufferSource() { const node = { buffer: null, playbackRate: {}, connect() {}, disconnect() {}, start() { played.push(node.buffer); }, stop() {} }; return node; }
        decodeAudioData(bytes) { return Promise.resolve(bytes); }
        resume() { this.state = 'running'; return Promise.resolve(); }
        suspend() { this.state = 'suspended'; return Promise.resolve(); }
    }
    const window = { AudioContext, localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) }, clearTimeout() {}, setTimeout() {}, addEventListener(name, callback) { (listeners[name] ||= []).push(callback); } };
    vm.runInNewContext(source, { window, document, performance: { now: () => time }, fetch: async (url) => ({ ok: true, arrayBuffer: async () => url }), MutationObserver: class { constructor(callback) { observe = callback; } observe() {} }, queueMicrotask, console });
    return { api: window.NetGuardAudio, played, storage, document, feedback, prologueText, tick: (ms) => { time += ms; }, mutate: () => observe(), emit: (name) => listeners[name]?.forEach((callback) => callback()) };
};

test('effects have independent persisted volume and mute preferences', async () => {
    const game = setup({ enabled: false, typing: false, volume: 23 });
    await flush();
    game.api.play('correct');
    await flush();
    assert.equal(game.played.length, 0);
    game.api.setEnabled(true);
    game.api.setVolume(200);
    game.api.play('correct');
    await flush();
    assert.ok(game.played[0].endsWith('/confirmation_001.ogg'));
    assert.deepEqual(JSON.parse(game.storage.get('netguard:sfx:42')), { enabled: true, typing: false, volume: 100 });
});

test('rapid typing is throttled and disabled typing remains silent', async () => {
    const game = setup(); await flush();
    game.api.play('typing'); game.api.play('typing'); await flush();
    assert.equal(game.played.length, 1);
    const quiet = setup({ typing: false, volume: 45 }); await flush();
    quiet.api.play('typing'); await flush(); assert.equal(quiet.played.length, 0);
});

test('hidden pages and pages being left do not play effects', async () => {
    const game = setup(); await flush();
    game.document.visibilityState = 'hidden'; game.api.play('error'); await flush();
    assert.equal(game.played.length, 0);
    game.document.visibilityState = 'visible'; game.emit('pagehide'); game.api.play('correct'); await flush();
    assert.equal(game.played.length, 0);
});

test('wrong and correct feedback trigger distinct sounds without repeated observer sounds', async () => {
    const game = setup(); await flush();
    game.feedback.textContent = 'Periksa nama port'; game.feedback.dataset.kind = 'error'; game.mutate(); await flush();
    assert.ok(game.played[0].endsWith('/error_003.ogg'));
    game.tick(500); game.mutate(); await flush(); assert.equal(game.played.length, 1);
    game.feedback.textContent = 'Tersimpan'; game.feedback.dataset.kind = 'success'; game.mutate(); await flush();
    assert.ok(game.played[1].endsWith('/confirmation_001.ogg'));
});

test('result sounds suppress queued clicks and typing', async () => {
    const game = setup(); await flush();
    game.api.play('click'); game.tick(1); game.api.play('error'); game.api.play('typing'); await flush();
    assert.equal(game.played.length, 1);
    assert.ok(game.played[0].endsWith('/error_003.ogg'));
});

test('rolling prologue text plays typing sounds while completing a whole paragraph does not', async () => {
    const game = setup(); await flush();
    game.prologueText.textContent = 'H'; game.mutate(); await flush();
    assert.ok(game.played[0].endsWith('/tick_001.ogg'));
    game.tick(100);
    game.prologueText.textContent = 'Here is the completed introduction'; game.mutate(); await flush();
    assert.equal(game.played.length, 1);
});

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
    const requests = [];
    const gains = [];
    const compressors = [];
    const storage = new Map(saved ? [['netguard:sfx:42', JSON.stringify(saved)]] : []);
    const listeners = {};
    const feedback = { textContent: '', dataset: {}, hidden: false, closest: () => null, matches: () => false };
    const prologueText = { textContent: '', hidden: false, closest: () => null, matches: () => false };
    let observe;
    const document = {
        body: {}, visibilityState: 'visible',
        querySelector(selector) { return selector === '[data-game-sfx]' ? { dataset: { userId: '42' } } : null; },
        querySelectorAll(selector) { return selector.startsWith('[data-feedback]') ? [feedback] : selector.startsWith('[data-dialogue-text]') ? [prologueText] : []; },
        addEventListener(name, callback) { (listeners[name] ||= []).push(callback); },
    };
    class AudioContext {
        constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
        createGain() { const node = { gain: { value: 1, setValueAtTime(value) { this.value = value; } }, connect(target) { this.target = target; }, disconnect() {} }; gains.push(node); return node; }
        createDynamicsCompressor() { const node = { threshold: {}, knee: {}, ratio: {}, attack: {}, release: {}, connect(target) { this.target = target; } }; compressors.push(node); return node; }
        createBufferSource() { const node = { buffer: null, playbackRate: {}, connect() {}, disconnect() {}, start() { played.push(node.buffer); }, stop() {} }; return node; }
        decodeAudioData(bytes) { const encoded = Buffer.from(bytes).toString('base64'); const file = Object.entries(window.NetGuardSoundData).find(([, data]) => data === encoded)?.[0]; return Promise.resolve('/audio/sfx/' + file + '.ogg'); }
        resume() { this.state = 'running'; return Promise.resolve(); }
        suspend() { this.state = 'suspended'; return Promise.resolve(); }
    }
    const window = { AudioContext, atob: (value) => Buffer.from(value, 'base64').toString('binary'), localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) }, clearTimeout() {}, setTimeout() {}, addEventListener(name, callback) { (listeners[name] ||= []).push(callback); } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/game-sound-data.js'), 'utf8'), { window });
    vm.runInNewContext(source, { window, document, performance: { now: () => time }, fetch: async (url) => { requests.push(url); throw new Error('Unexpected audio request'); }, MutationObserver: class { constructor(callback) { observe = callback; } observe() {} }, queueMicrotask, console });
    return { api: window.NetGuardAudio, played, requests, gains, compressors, storage, document, feedback, prologueText, tick: (ms) => { time += ms; }, mutate: () => observe(), emit: (name) => listeners[name]?.forEach((callback) => callback()) };
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

test('all effects decode from the bundled assets without fetching audio or triggering downloads', async () => {
    for (const name of ['click', 'select', 'back', 'open', 'close', 'minimize', 'maximize', 'dialogue', 'typing', 'correct', 'error', 'complete', 'chapter']) {
        const game = setup({ enabled: true, typing: true, volume: 100 });
        await flush(); game.api.play(name); await flush();
        assert.equal(game.played.length, 1, name);
        assert.equal(game.requests.length, 0, name);
    }
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/game-sound-data.js'), 'utf8'), context);
    for (const [name, encoded] of Object.entries(context.window.NetGuardSoundData)) {
        const original = fs.readFileSync(path.join(__dirname, '../public/audio/sfx', name + '.ogg'));
        assert.deepEqual(Buffer.from(encoded, 'base64'), original, name);
        assert.equal(original.subarray(0, 4).toString(), 'OggS');
    }
});

test('rapid typing is throttled and disabled typing remains silent', async () => {
    const game = setup(); await flush();
    game.api.play('typing'); game.api.play('typing'); await flush();
    assert.equal(game.played.length, 1);
    const quiet = setup({ typing: false, volume: 45 }); await flush();
    quiet.api.play('typing'); await flush(); assert.equal(quiet.played.length, 0);
});

test('effects use stronger output at full volume through a limiter while zero and mute remain silent', async () => {
    const game = setup({ enabled: true, typing: true, volume: 100 }); await flush();
    const master = game.gains[0];
    assert.equal(master.gain.value, 2.5);
    assert.equal(master.target, game.compressors[0]);
    assert.equal(game.compressors[0].threshold.value, -3);
    assert.equal(game.compressors[0].ratio.value, 20);
    game.api.setVolume(50);
    assert.equal(master.gain.value, 1.25);
    game.api.setVolume(0);
    assert.equal(master.gain.value, 0);
    game.api.play('click'); await flush();
    assert.equal(game.played.length, 0);
    game.api.setVolume(100); game.api.setEnabled(false);
    assert.equal(master.gain.value, 0);
    game.api.play('error'); await flush();
    assert.equal(game.played.length, 0);
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

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const boot = ({ phone = true, supported = true, rejected = false, orientationRejected = false, navbar = true } = {}) => {
    const node = () => ({ hidden: false, disabled: false, attributes: {}, listeners: {}, children: [], setAttribute(key, value) { this.attributes[key] = value; }, append(child) { this.children.push(child); }, addEventListener(key, callback) { this.listeners[key] = callback; } });
    const header = node(), body = node(), page = node();
    const events = {}, media = { matches: phone, addEventListener(key, callback) { this.change = callback; } }, calls = [];
    const document = { fullscreenElement: null, documentElement: page, body, querySelector: (selector) => navbar && selector === '.chapter-navbar, .game-navbar' ? header : null, createElement: node, addEventListener(key, callback) { events[key] = callback; } };
    if (supported) {
        page.requestFullscreen = async () => { calls.push('enter'); if (rejected) throw new Error('Denied'); document.fullscreenElement = page; };
        document.exitFullscreen = async () => { calls.push('exit'); document.fullscreenElement = null; };
    }
    const context = { document, screen: { orientation: { async lock(mode) { calls.push(mode); if (orientationRejected) throw new Error('Unsupported'); } } }, window: { matchMedia: () => media, setTimeout: () => 1, clearTimeout() {} } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/device-layout.js'), 'utf8'), context);
    return { control: header.children[0], notice: body.children[0], media, calls, events };
};

test('fullscreen control is phone-only and responds to device changes', () => {
    const game = boot({ phone: false }); assert.equal(game.control.hidden, true);
    game.media.matches = true; game.media.change(); assert.equal(game.control.hidden, false);
    assert.equal(game.control.attributes['aria-label'], 'Layar penuh');
    assert.equal(boot({ navbar: false }).control, undefined);
});

test('phone fullscreen enters, requests landscape, and can exit again', async () => {
    const game = boot(); await game.control.listeners.click();
    assert.deepEqual(game.calls, ['enter', 'landscape']); assert.equal(game.control.attributes['aria-pressed'], 'true');
    assert.equal(game.control.disabled, false); await game.control.listeners.click();
    assert.equal(game.calls[2], 'exit'); assert.equal(game.control.attributes['aria-pressed'], 'false');
});

test('unsupported or denied fullscreen gives a readable fallback without leaving controls disabled', async () => {
    for (const options of [{ supported: false }, { rejected: true }]) {
        const game = boot(options); await game.control.listeners.click();
        assert.equal(game.notice.hidden, false); assert.match(game.notice.textContent, /landscape/); assert.equal(game.control.disabled, false);
    }
    const game = boot({ orientationRejected: true }); await game.control.listeners.click();
    assert.equal(game.control.attributes['aria-pressed'], 'true'); assert.equal(game.notice.hidden, true);
});

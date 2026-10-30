const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const setup = (options = {}) => {
    const nodes = new Map();
    const get = (selector) => {
        if (!nodes.has(selector)) nodes.set(selector, { hidden: true, value: '', textContent: '', handlers: {}, attributes: {}, parentElement: { scrollHeight: 100 }, addEventListener(name, callback) { this.handlers[name] = callback; }, setAttribute(name, value) { this.attributes[name] = value; }, focus() { this.focused = true; } });
        return nodes.get(selector);
    };
    const desktop = get('[data-pc-desktop]');
    const nativeSurface = { inert: false };
    const host = { dataset: {}, querySelectorAll: () => [nativeSurface] };
    get('[data-pc-toolbar]').parentElement = host;
    desktop.querySelector = get;
    const context = { window: {}, document: { querySelector: get, querySelectorAll: () => [get('[data-open-client-cmd]'), get('[data-pc-task-cmd]')] } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/lab-pc-desktop.js'), 'utf8'), context);
    let opens = 0, homes = 0, cmds = 0;
    const controller = context.window.NetGuardPcDesktop.create({ onOpenWinbox() { opens++; }, onHome() { homes++; }, onCmd() { cmds++; }, ...options });
    return { get, controller, host, nativeSurface, counts: () => ({ opens, homes, cmds }) };
};

test('desktop, WinBox and CMD open on the same PC without recreating or resetting the session', () => {
    const lab = setup();
    lab.controller.setAvailable(true);
    assert.equal(lab.get('[data-pc-toolbar]').hidden, false);
    lab.get('[data-pc-home]').handlers.click();
    assert.equal(lab.get('[data-pc-desktop]').hidden, false);
    assert.equal(lab.nativeSurface.inert, true);
    assert.equal(lab.host.dataset.pcView, 'desktop');
    lab.get('[data-open-client-cmd]').handlers.click();
    assert.equal(lab.get('[data-client-cmd]').hidden, false);
    lab.get('[data-client-terminal]').textContent = 'previous command output';
    lab.get('[data-pc-open-winbox]').handlers.click();
    assert.equal(lab.get('[data-pc-desktop]').hidden, true);
    assert.equal(lab.nativeSurface.inert, false);
    lab.get('[data-pc-home]').handlers.click();
    lab.get('[data-open-client-cmd]').handlers.click();
    assert.equal(lab.get('[data-client-terminal]').textContent, 'previous command output');
    assert.deepEqual(lab.counts(), { opens: 1, homes: 2, cmds: 2 });
    lab.controller.setAvailable(false);
    assert.equal(lab.get('[data-pc-desktop]').hidden, true);
});

test('Windows taskbar switches applications and blocks the underlying WinBox while CMD is active', () => {
    const lab = setup({ handleCommands: false });
    lab.controller.setAvailable(true);
    lab.get('[data-pc-task-cmd]').handlers.click();
    assert.equal(lab.host.dataset.pcView, 'cmd');
    assert.equal(lab.get('[data-client-cmd]').hidden, false);
    assert.equal(lab.nativeSurface.inert, true);
    assert.equal(lab.get('[data-pc-task-cmd]').attributes['aria-pressed'], 'true');
    lab.get('[data-client-terminal]').textContent = 'Reply from 8.8.8.8';
    lab.get('[data-pc-task-winbox]').handlers.click();
    assert.equal(lab.host.dataset.pcView, 'winbox');
    assert.equal(lab.nativeSurface.inert, false);
    assert.equal(lab.get('[data-pc-task-winbox]').attributes['aria-pressed'], 'true');
    lab.get('[data-pc-task-cmd]').handlers.click();
    assert.equal(lab.get('[data-client-terminal]').textContent, 'Reply from 8.8.8.8');
    lab.get('[data-close-client-cmd]').handlers.click();
    assert.equal(lab.host.dataset.pcView, 'desktop');
    lab.controller.showPreview();
    assert.equal(lab.get('[data-pc-desktop]').hidden, true);
    assert.equal(lab.nativeSurface.inert, false);
    assert.equal(lab.get('[data-pc-home]').attributes['aria-pressed'], 'true');
});

test('early chapter CMD reads current local DHCP configuration and cannot grant internet success', () => {
    let network = null;
    const errors = [];
    const lab = setup({ getNetwork: () => network, onError: (text) => errors.push(text) });
    const command = (text) => { lab.get('[data-client-command]').value = text; lab.get('form').handlers.submit({ preventDefault() {} }); };
    command('ipconfig /all');
    assert.match(lab.get('[data-client-terminal]').textContent, /0\.0\.0\.0/);
    network = { address: '192.168.100.2', gateway: '192.168.100.1' };
    command('ipconfig');
    assert.match(lab.get('[data-client-terminal]').textContent, /192\.168\.100\.2/);
    command('ping google.com');
    assert.equal(errors.length, 1);
    assert.doesNotMatch(lab.get('[data-client-terminal]').textContent, /Reply from|Received = 4/);
    command('cls');
    assert.equal(lab.get('[data-client-terminal]').textContent, '');
});

test('chapter three can own CMD validation without a second command handler', () => {
    const lab = setup({ handleCommands: false });
    assert.equal(lab.get('form').handlers.submit, undefined);
});

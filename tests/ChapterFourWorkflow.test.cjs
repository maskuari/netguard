const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const boot = (savedState = null, previous = {}) => {
    const nodes = new Map(), timers = [], errors = [];
    class Element {
        constructor() { this.dataset = {}; this.hidden = true; this.open = false; this.value = ''; this.checked = false; this.textContent = ''; this.children = []; this.style = {}; this.listeners = {}; this.attributes = {}; this.classList = { contains: () => false, toggle() {}, add() {}, remove() {} }; }
        addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
        emit(name, patch = {}) { for (const callback of this.listeners[name] || []) callback({ preventDefault() {}, stopPropagation() {}, target: this, ...patch }); }
        querySelector(selector) { return get(selector); }
        querySelectorAll(selector) { return all(selector); }
        setAttribute(name, value) { this.attributes[name] = value; }
        hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
        append(...children) { this.children.push(...children); }
        replaceChildren(...children) { this.children = children; }
        remove() {}
        focus() {}
        closest() { return null; }
        showModal() { this.open = true; }
        close() { this.open = false; }
    }
    const get = (selector) => { if (!nodes.has(selector)) nodes.set(selector, new Element()); return nodes.get(selector); };
    const make = (selector, key, values) => values.map((value) => { const node = get('[' + key + '="' + value + '"]'); node.dataset[key.replace(/^data-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value; return node; });
    const windowNames = ['wireless', 'wireless-edit', 'security-edit', 'wireless-tool', 'hotspot', 'hotspot-setup', 'hotspot-detail', 'profile-edit', 'user-edit', 'files', 'upload-picker', 'interfaces', 'identity', 'addresses', 'wan', 'dns', 'firewall', 'routes', 'terminal', 'ping'];
    const sets = {
        '[data-window]': make('', 'data-window', windowNames),
        '[data-open-window]': make('', 'data-open-window', windowNames),
        '[data-close]': make('', 'data-close', windowNames),
        '[data-minimize]': make('', 'data-minimize', windowNames),
        '[data-maximize]': make('', 'data-maximize', windowNames),
        '[data-wireless-tab]': make('', 'data-wireless-tab', ['interfaces', 'w60g', 'nstreme', 'access', 'registration', 'connect', 'security', 'channels']),
        '[data-wireless-panel]': make('', 'data-wireless-panel', ['interfaces', 'w60g', 'nstreme', 'access', 'registration', 'connect', 'security', 'channels']),
        '[data-radio-tab]': make('', 'data-radio-tab', ['general', 'wireless', 'ht', 'wds', 'nstreme', 'nv2', 'status', 'traffic']),
        '[data-radio-panel]': make('', 'data-radio-panel', ['general', 'wireless', 'ht', 'wds', 'nstreme', 'nv2', 'status', 'traffic']),
        '[data-security-tab]': make('', 'data-security-tab', ['general', 'radius', 'eap', 'static']),
        '[data-security-panel]': make('', 'data-security-panel', ['general', 'radius', 'eap', 'static']),
        '[data-radio-option]': make('', 'data-radio-option', ['band', 'frequency', 'width']),
        '[data-remove-security]': [get('[data-remove-security]')],
        '[data-dns-server]': make('', 'data-dns-server', ['0', '1']),
        '.ch2-nav > button': make('', 'data-open-window', ['wireless', 'files', 'interfaces']),
        '[data-hotspot-tab]': make('', 'data-hotspot-tab', ['Servers', 'Server Profiles', 'Users', 'User Profiles', 'Active', 'Hosts', 'IP Bindings', 'Service Ports', 'Walled Garden', 'Walled Garden IP List', 'Cookies']),
        '[data-profile-tab]': make('', 'data-profile-tab', ['general', 'queue', 'scripts']),
        '[data-profile-panel]': make('', 'data-profile-panel', ['general', 'queue', 'scripts']),
        '[data-user-tab]': make('', 'data-user-tab', ['general', 'limits', 'statistics']),
        '[data-user-panel]': make('', 'data-user-panel', ['general', 'limits', 'statistics']),
        '[data-profile-option]': make('', 'data-profile-option', ['idleTimeout', 'keepalive', 'autorefresh']),
        '[data-user-option]': make('', 'data-user-option', ['email', 'address', 'mac']),
        '[data-hotspot-tool]': make('', 'data-hotspot-tool', ['remove', 'enable', 'disable', 'comment', 'filter', 'reset-counters', 'reset-all-counters']),
        '[data-save-form]': make('', 'data-save-form', ['wireless-edit', 'security-edit', 'profile-edit', 'user-edit']),
        '[data-edit-form]': make('', 'data-edit-form', ['wireless-edit', 'security-edit', 'profile-edit', 'user-edit']),
        '[data-ch2-menu]': make('', 'data-ch2-menu', ['ip', 'system', 'tools']),
        '[data-phone-screen]': make('', 'data-phone-screen', ['home', 'wifi', 'browser']),
    };
    const all = (selector) => sets[selector] || [];
    const scene = get('.ch4-scene'); scene.dataset = { userId: '42', completeUrl: '/complete' };
    const storage = new Map();
    for (const [key, state] of Object.entries(previous)) storage.set(key, JSON.stringify(state));
    if (savedState) storage.set('netguard.chapter-four.v1.42', JSON.stringify(savedState));
    const document = { querySelector: get, querySelectorAll: all, createElement: () => new Element(), addEventListener() {}, activeElement: null };
    const context = {
        document, localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
        window: {
            setTimeout(callback) { const timer = { callback, cancelled: false }; timers.push(timer); return timer; }, clearTimeout(timer) { if (timer) timer.cancelled = true; },
            setInterval() { return 1; }, clearInterval() {}, matchMedia: () => ({ matches: true }),
            NetGuardAudio: { play() {} }, NetGuardEvaluation: { showResult() {}, clear() {}, showError: (text) => errors.push(text) },
            NetGuardChapterNavbar: { setBackEnabled() {}, bindPrevious(callback) { context.previous = callback; } },
            NetGuardPcDesktop: { create: (options) => { context.pcOptions = options; return { setAvailable() {}, setNetwork() {}, showDesktop: () => options.onHome?.(), showWinbox: () => options.onOpenWinbox?.(), hideDesktop() {} }; } },
            NetGuardStepGuide: { create(options) { context.plan = options.getPlan; options.getPlan(); return { refresh: () => options.getPlan() }; } },
        },
    };
    context.window.localStorage = context.localStorage;
    vm.createContext(context);
    for (const file of ['router-configuration.js', 'chapter-four-simulation.js', 'chapter-four-workbench.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/js', file), 'utf8'), context);
    const click = (selector) => get(selector).emit('click');
    const dismiss = () => get('[data-ch2-dialogue]').emit('click');
    const begin = () => { for (let count = 0; count < 3 && !get('[data-ch2-dialogue]').hidden; count++) dismiss(); click('[data-learning-continue]'); };
    const flush = () => { while (timers.length) { const timer = timers.shift(); if (!timer.cancelled) timer.callback(); } };
    const state = () => JSON.parse(storage.get('netguard.chapter-four.v1.42'));
    const setField = (name, value) => { get('[data-field="' + name + '"]').value = value; };
    return { get, click, begin, dismiss, flush, state, setField, context, storage, submit: (selector) => get(selector).emit('submit') };
};

test('new Chapter 4 stays empty until manual navigation and requires actual wireless saves', () => {
    const game = boot();
    for (let index = 0; index < 5; index++) game.click('[data-ch2-prologue]');
    game.begin();
    assert.equal(game.state().stage, 'wireless');
    assert.equal(game.get('[data-window="wireless"]').hidden, true);
    game.click('[data-open-window="wireless"]');
    game.click('[data-enable-wlan]');
    assert.equal(game.state().wireless.enabled, false);
    game.dismiss();
    game.click('[data-wlan-row]'); game.click('[data-enable-wlan]');
    game.get('[data-wlan-row]').emit('dblclick'); game.click('[data-radio-tab="wireless"]');
    game.setField('mode', 'station'); game.setField('ssid', 'SMKN1-Amuntai');
    game.click('[data-save-form="wireless-edit"]');
    assert.equal(game.state().wireless.mode, 'station');
    game.dismiss(); game.setField('mode', 'ap bridge');
    assert.equal(game.state().wireless.mode, 'station');
    game.setField('security', 'default'); game.setField('wlan-name', 'wlan1');
    game.click('[data-save-form="wireless-edit"]'); game.flush();
    assert.equal(game.state().wireless.mode, 'ap bridge');
    assert.equal(game.state().stage, 'wireless');
    game.begin();
    assert.equal(game.state().stage, 'security');
    assert.equal(game.get('[data-window="security-edit"]').hidden, true);
});

test('Chapter 4 retains earlier identity, interfaces, disabled addresses, DHCP pools, DNS and NAT without rewriting earlier progress', () => {
    const one = { identityInput: 'Router Lab', identitySaved: true, interfaceNames: { ether1: 'WAN-ISP', ether2: 'Trunk', ether3: 'PC-Lab' } };
    const two = { identity: 'Router Sekolah', interfaces: one.interfaceNames, vlan: { student: true, teacher: true }, addresses: { local: true, student: true, wireless: true }, addressDisabled: { student: true }, pools: { local: '192.168.100.11-192.168.100.42', wireless: '192.168.20.10-192.168.20.50' }, dhcpSettings: { wireless: { dns: '9.9.9.9', lease: '30m' } }, wanClient: { bound: true, disabled: false, defaultRoute: 'yes', distance: 2 } };
    const three = { stage: 'finish', dns: { servers: ['9.9.9.9', '1.1.1.1'], remote: true }, nat: { chain: 'srcnat', out: 'WAN-ISP', action: 'masquerade', packets: 23, disabled: false } };
    const snapshots = { 'netguard.chapter-one.v1.42': one, 'netguard.chapter-two.v2.42': two, 'netguard.chapter-three.v1.42': three };
    const game = boot(null, snapshots);
    assert.equal(game.get('[data-inherited-identity]').value, 'Router Sekolah');
    const interfaces = game.get('[data-inherited-interfaces]').children.map((row) => row.children.map((cell) => cell.textContent));
    assert.equal(interfaces[1][0], 'WAN-ISP');
    assert.equal(interfaces[3][0], 'PC-Lab');
    assert.equal(interfaces.find((row) => row[0] === 'wlan1')[3], 'X');
    const addresses = game.get('[data-inherited-addresses]').children.map((row) => row.children.map((cell) => cell.textContent));
    assert.equal(addresses.length, 4);
    assert.equal(addresses[2][1], 'X 192.168.40.1/24');
    assert.equal(game.get('[data-dns-server="0"]').value, '9.9.9.9');
    assert.equal(game.get('[data-dns-server="1"]').value, '1.1.1.1');
    assert.equal(game.get('[data-dns-remote]').checked, true);
    assert.equal(game.get('[data-inherited-nat-out]').textContent, 'WAN-ISP');
    assert.equal(game.get('[data-nat-packets]').textContent, '23');
    const dhcp = game.get('[data-inherited-dhcp]').children.map((row) => row.children.map((cell) => cell.textContent));
    assert.equal(dhcp[2][2], '192.168.20.10-192.168.20.50');
    assert.equal(dhcp[2][3], '30m');
    for (const [key, snapshot] of Object.entries(snapshots)) assert.deepEqual(JSON.parse(game.storage.get(key)), snapshot);
});

test('Wireless tabs, radio tabs and Security Profile tabs show their own panels without completing a mission', () => {
    const game = boot({ ...wifiState('security'), wireless: { enabled: true, mode: 'ap bridge', ssid: 'SMKN1-Amuntai', security: 'default' }, security: null });
    game.click('[data-open-window="wireless"]');
    game.click('[data-wireless-tab="registration"]');
    assert.equal(game.get('[data-wireless-panel="registration"]').hidden, false);
    assert.equal(game.get('[data-wireless-panel="interfaces"]').hidden, true);
    assert.equal(game.get('[data-wireless-count]').textContent, '0 items');
    game.click('[data-wireless-tab="interfaces"]');
    game.get('[data-wlan-row]').emit('dblclick');
    game.click('[data-radio-tab="status"]');
    assert.equal(game.get('[data-radio-panel="status"]').hidden, false);
    assert.equal(game.get('[data-radio-panel="general"]').hidden, true);
    assert.equal(game.get('[data-radio-status]').value, 'running-ap');
    game.click('[data-radio-tab="wireless"]');
    assert.equal(game.get('[data-radio-panel="wireless"]').hidden, false);
    assert.equal(game.get('[data-radio-panel="status"]').hidden, true);
    game.click('[data-add-security]');
    game.click('[data-security-tab="radius"]');
    assert.equal(game.get('[data-security-panel="radius"]').hidden, false);
    assert.equal(game.get('[data-security-panel="general"]').hidden, true);
    assert.equal(game.state().stage, 'security');
    assert.equal(game.state().security, null);
});

test('additional wireless settings survive save and reopening; a user security profile is offered only after creation', () => {
    const game = boot({ stage: 'wireless', prologueComplete: true, wireless: { enabled: true, mode: 'station', ssid: 'MikroTik', security: 'default' } });
    game.get('[data-wlan-row]').emit('dblclick');
    assert.deepEqual(game.get('[data-field="security"]').children.map((option) => option.value), ['default']);
    game.setField('mode', 'ap bridge'); game.setField('ssid', 'SMKN1-Amuntai');
    game.get('[data-radio-option="band"]').value = '2GHz-B/G/N';
    game.get('[data-radio-option="frequency"]').value = '2437';
    game.get('[data-radio-option="width"]').value = '20MHz';
    game.click('[data-save-form="wireless-edit"]');
    assert.equal(game.state().wireless.options.frequency, '2437');
    game.get('[data-radio-option="frequency"]').value = '2412';
    game.get('[data-wlan-row]').emit('dblclick');
    assert.equal(game.get('[data-radio-option="frequency"]').value, '2437');
    assert.equal(game.get('[data-radio-option="band"]').value, '2GHz-B/G/N');
    game.click('[data-radio-toggle]');
    assert.equal(game.state().wireless.enabled, false);
    assert.equal(game.get('[data-wlan-flags]').textContent, 'X');
    assert.equal(game.get('[data-radio-status]').value, 'disabled');
});

test('security requires saving both keys and explicitly applying user to wlan1', () => {
    const game = boot();
    for (let index = 0; index < 5; index++) game.click('[data-ch2-prologue]');
    game.begin(); game.click('[data-wlan-row]'); game.click('[data-enable-wlan]'); game.get('[data-wlan-row]').emit('dblclick');
    game.setField('mode', 'ap bridge'); game.setField('ssid', 'SMKN1-Amuntai'); game.setField('security', 'default'); game.setField('wlan-name', 'wlan1');
    game.click('[data-save-form="wireless-edit"]'); game.flush(); game.begin();
    game.click('[data-wireless-tab="security"]'); game.click('[data-add-security]');
    for (const [key, value] of [['security-name', 'user'], ['security-mode', 'dynamic keys'], ['wpa-key', 'Sekolah123'], ['wpa2-key', 'Sekolah123']]) game.setField(key, value);
    game.get('[data-field="wpa"]').checked = true;
    game.click('[data-save-form="security-edit"]');
    assert.equal(game.state().security, null);
    game.dismiss(); game.get('[data-field="wpa2"]').checked = true; game.click('[data-save-form="security-edit"]');
    assert.equal(game.state().wireless.security, 'default');
    game.flush(); assert.equal(game.get('[data-ch2-dialogue]').hidden, true);
    game.click('[data-wireless-tab="interfaces"]'); game.get('[data-wlan-row]').emit('dblclick'); game.click('[data-radio-tab="wireless"]');
    game.setField('security', 'user'); game.click('[data-save-form="wireless-edit"]'); game.flush(); game.begin();
    assert.equal(game.state().stage, 'hotspot');
    game.click('[data-open-window="hotspot"]'); game.click('[data-hotspot-setup]');
    game.get('[data-setup-select]').value = 'ether1-internet'; game.click('[data-setup-next]');
    assert.equal(game.state().hotspot, null);
    assert.match(game.get('[data-dialogue-text]').textContent, /wlan1/);
});

const wifiState = (stage) => ({ stage, prologueComplete: true,
    wireless: { enabled: true, mode: 'ap bridge', ssid: 'SMKN1-Amuntai', security: 'user' },
    security: { name: 'user', mode: 'dynamic keys', wpa: true, wpa2: true, key: 'Sekolah123', key2: 'Sekolah123' },
});
const hotspot = { interface: 'wlan1', dnsName: 'hotspot-tkj.com', user: 'admin', password: 'admin' };

test('custom WiFi names and passwords work through saving, applying the profile and connecting the HP', () => {
    const game = boot({ stage: 'wireless', prologueComplete: true, wireless: { enabled: true, mode: 'station', ssid: 'MikroTik', security: 'default' } });
    game.get('[data-wlan-row]').emit('dblclick'); game.setField('mode', 'ap bridge'); game.setField('ssid', 'Perpustakaan Sekolah');
    game.click('[data-save-form="wireless-edit"]'); game.flush(); game.begin();
    assert.equal(game.state().stage, 'security');
    game.click('[data-add-security]'); game.setField('security-name', 'maskuari'); game.setField('security-mode', 'dynamic keys');
    game.get('[data-field="wpa"]').checked = true; game.get('[data-field="wpa2"]').checked = true;
    game.setField('wpa-key', 'KunciWPA123'); game.setField('wpa2-key', 'KunciWiFi456');
    game.click('[data-save-form="security-edit"]');
    assert.equal(game.state().security.name, 'maskuari');
    assert.equal(game.get('[data-security-name-row]').textContent, 'maskuari');
    game.get('[data-wlan-row]').emit('dblclick');
    assert.deepEqual(game.get('[data-field="security"]').children.map((node) => node.value), ['default', 'maskuari']);
    game.setField('security', 'maskuari'); game.click('[data-save-form="wireless-edit"]'); game.flush(); game.begin();
    assert.equal(game.state().stage, 'hotspot');
    const phone = boot({ ...game.state(), stage: 'connect', hotspot, hotspotConfirmed: true });
    phone.click('[data-phone-network]');
    phone.get('[data-wifi-password]').value = 'Sekolah123'; phone.submit('[data-wifi-connect]');
    assert.equal(phone.state().phoneConnected, false);
    phone.dismiss(); phone.get('[data-wifi-password]').value = 'KunciWiFi456'; phone.submit('[data-wifi-connect]');
    assert.equal(phone.state().phoneConnected, true);
    assert.match(phone.get('[data-phone-status]').textContent, /Perpustakaan Sekolah/);
    phone.click('[data-add-security]'); phone.setField('security-name', 'wifi-baru'); phone.setField('security-mode', 'dynamic keys');
    phone.get('[data-field="wpa"]').checked = true; phone.get('[data-field="wpa2"]').checked = true;
    phone.setField('wpa-key', 'KunciBaru123'); phone.setField('wpa2-key', 'KunciBaru456'); phone.click('[data-save-form="security-edit"]');
    assert.equal(phone.state().phoneConnected, false);
    assert.equal(phone.state().wireless.security, 'wifi-baru');
});

test('HotSpot wizard validates each screen and waits for OK before progressing to the HP', () => {
    const game = boot(wifiState('hotspot'));
    game.click('[data-open-window="hotspot"]'); game.click('[data-hotspot-setup]');
    const defaults = ['wlan1', '192.168.20.1/24', '192.168.20.2-192.168.20.254', 'none', '0.0.0.0', '8.8.8.8,8.8.4.4', 'hotspot-tkj.com'];
    for (const [index, value] of defaults.entries()) {
        game.get(index === 0 || index === 3 ? '[data-setup-select]' : '[data-setup-input]').value = value;
        game.click('[data-setup-next]');
    }
    game.get('[data-setup-credential="name"]').value = 'admin';
    game.get('[data-setup-credential="password"]').value = 'wrong'; game.click('[data-setup-next]');
    assert.equal(game.state().hotspot, null);
    game.dismiss(); game.get('[data-setup-credential="password"]').value = 'admin'; game.click('[data-setup-next]');
    assert.equal(game.state().hotspot.interface, 'wlan1');
    assert.notEqual(game.state().hotspotConfirmed, true);
    game.flush(); assert.equal(game.state().stage, 'hotspot');
    game.click('[data-setup-next]'); game.flush(); game.begin();
    assert.equal(game.state().hotspotConfirmed, true);
    assert.equal(game.state().stage, 'connect');
});

test('HP requires the WiFi key then separate portal credentials; opening HP does not complete it', () => {
    const game = boot({ ...wifiState('connect'), hotspot, hotspotConfirmed: true });
    game.click('[data-open-phone]'); game.click('[data-phone-network]');
    game.get('[data-wifi-password]').value = 'admin'; game.submit('[data-wifi-connect]');
    assert.equal(game.state().phoneConnected, false);
    game.dismiss(); game.get('[data-wifi-password]').value = 'Sekolah123'; game.submit('[data-wifi-connect]');
    assert.equal(game.state().phoneConnected, true);
    assert.equal(game.state().initialLogin, false);
    game.get('[data-phone-user]').value = 'admin'; game.get('[data-phone-password]').value = 'Sekolah123'; game.submit('[data-phone-login]');
    assert.equal(game.state().initialLogin, false);
    game.dismiss(); game.get('[data-phone-password]').value = 'admin'; game.submit('[data-phone-login]');
    assert.equal(game.state().initialLogin, true);
    assert.match(game.get('[data-session-details]').textContent, /192\.168\.20\.2/);
    game.flush(); game.begin(); assert.equal(game.state().stage, 'portal');
});

test('HP starts on its home screen, connects through WiFi settings and opens the portal browser', () => {
    const game = boot({ ...wifiState('connect'), hotspot, hotspotConfirmed: true });
    game.click('[data-open-phone]');
    assert.equal(game.get('[data-phone-screen="home"]').hidden, false);
    assert.equal(game.get('[data-phone-screen="wifi"]').hidden, true);
    assert.equal(game.get('[data-phone-browser]').hidden, true);
    game.click('[data-phone-open-browser]');
    assert.equal(game.state().phoneConnected, false);
    assert.match(game.get('[data-dialogue-text]').textContent, /HP belum terhubung/);
    game.dismiss(); game.click('[data-phone-open-wifi]');
    assert.equal(game.get('[data-phone-screen="wifi"]').hidden, false);
    const toggle = game.get('[data-phone-wifi-toggle]'); toggle.checked = false;
    toggle.emit('change', { currentTarget: toggle });
    assert.equal(game.get('[data-phone-network]').hidden, true);
    game.get('[data-wifi-password]').value = 'Sekolah123'; game.submit('[data-wifi-connect]');
    assert.equal(game.state().phoneConnected, false);
    game.dismiss(); toggle.checked = true; toggle.emit('change', { currentTarget: toggle });
    game.click('[data-phone-network]'); game.submit('[data-wifi-connect]');
    assert.equal(game.state().phoneConnected, true);
    assert.equal(game.get('[data-phone-browser]').hidden, false);
    assert.equal(game.get('[data-phone-screen="wifi"]').hidden, true);
    game.click('[data-phone-home]');
    assert.equal(game.get('[data-phone-screen="home"]').hidden, false);
    game.click('[data-phone-open-browser]');
    assert.equal(game.get('[data-phone-browser]').hidden, false);
    game.click('[data-phone-back]');
    assert.equal(game.get('[data-phone-screen="wifi"]').hidden, false);
    game.click('[data-phone-forget]');
    assert.equal(game.state().phoneConnected, false);
    assert.equal(game.get('[data-phone-browser]').hidden, true);
});

test('profiles must save correct shared-user and rate values; each account must login and be inspected in Active', () => {
    const profiles = { kepalasekolah: { shared: 1, rate: '512k/512k' }, guru: { shared: 10, rate: '256k/256k' }, siswa: { shared: 5, rate: '128k/128k' } };
    const game = boot({ ...wifiState('profiles'), hotspot, hotspotConfirmed: true, initialLogin: true, phoneConnected: true });
    game.click('[data-hotspot-tab="User Profiles"]');
    for (const [name, target] of Object.entries(profiles)) {
        game.click('[data-hotspot-add]'); game.setField('profile-name', name); game.setField('shared', target.shared.toString()); game.setField('rate', target.rate);
        game.click('[data-save-form="profile-edit"]');
        assert.equal(game.state().profiles[name].rate, target.rate);
    }
    game.flush(); game.begin(); assert.equal(game.state().stage, 'users');
    game.click('[data-hotspot-tab="Users"]');
    for (const [name, password] of [['kepalasekolah', '123'], ['guru', '456'], ['siswa', '789']]) {
        game.click('[data-hotspot-add]'); game.setField('user-name', name); game.setField('user-password', password); game.setField('user-profile', name); game.click('[data-save-form="user-edit"]');
        assert.notEqual(game.state().verified[name], true);
        game.click('[data-phone-logout]'); game.get('[data-phone-user]').value = name; game.get('[data-phone-password]').value = password; game.submit('[data-phone-login]');
        assert.equal(game.state().verified[name], true);
        game.click('[data-hotspot-tab="Active"]');
        game.get('[data-hotspot-table]').children[1].emit('click');
        assert.equal(game.state().actions.users['active:' + name], true);
        game.click('[data-hotspot-tab="Users"]');
    }
    game.flush(); game.dismiss();
    assert.equal(game.state().stage, 'quiz');
    assert.equal(game.get('[data-quiz-dialog]').open, true);
});

test('native profile and user panels preserve extra fields; Active shows the real session fields and disabling prevents login', () => {
    const profiles = { guru: { shared: 10, rate: '256k/256k', options: { idleTimeout: 'none', keepalive: '00:02:00', autorefresh: '00:01:00' } } };
    const game = boot({ ...wifiState('users'), hotspot: { ...hotspot, pool: '192.168.20.25-192.168.20.50' }, hotspotConfirmed: true, phoneConnected: true, initialLogin: true, profiles });
    game.click('[data-hotspot-tab="User Profiles"]');
    const profileTable = game.get('[data-hotspot-table]');
    assert.equal(profileTable.children[1].children[0].textContent, 'default');
    profileTable.children[2].emit('dblclick');
    assert.equal(game.get('[data-profile-option="keepalive"]').value, '00:02:00');
    game.click('[data-profile-tab="queue"]');
    assert.equal(game.get('[data-profile-panel="queue"]').hidden, false);
    assert.equal(game.get('[data-profile-panel="general"]').hidden, true);
    game.click('[data-hotspot-tab="Users"]'); game.click('[data-hotspot-add]');
    game.setField('user-name', 'guru'); game.setField('user-password', '456'); game.setField('user-profile', 'guru');
    game.get('[data-user-option="email"]').value = 'guru@sekolah.test';
    game.click('[data-user-tab="limits"]');
    assert.equal(game.get('[data-user-panel="limits"]').hidden, false);
    game.click('[data-save-form="user-edit"]');
    assert.equal(game.state().users.guru.options.email, 'guru@sekolah.test');
    assert.notEqual(game.state().verified.guru, true);
    game.get('[data-phone-user]').value = 'guru'; game.get('[data-phone-password]').value = '456'; game.submit('[data-phone-login]');
    game.click('[data-hotspot-tab="Active"]');
    const table = game.get('[data-hotspot-table]');
    const headers = table.children[0].children.map((cell) => cell.textContent);
    assert.equal(headers.includes('Rate Limit'), false); assert.equal(headers.includes('Profile'), false);
    assert.equal(headers.includes('MAC Address'), true);
    assert.equal(table.children[1].children[2].textContent, '192.168.20.25');
    assert.match(game.get('[data-session-details]').textContent, /192\.168\.20\.25/);
    game.click('[data-hotspot-tab="Users"]');
    game.get('[data-hotspot-table]').children[2].emit('click');
    game.click('[data-hotspot-tool="disable"]');
    assert.equal(game.state().users.guru.disabled, true);
    game.submit('[data-phone-login]');
    assert.equal(game.get('[data-phone-session]').hidden, true);
});

test('previous stage preserves wireless while clearing security and all downstream work', () => {
    const game = boot({ ...wifiState('hotspot'), hotspot, hotspotConfirmed: true, initialLogin: true, profiles: { guru: { shared: 10, rate: '256k/256k' } } });
    game.context.previous();
    assert.equal(game.state().stage, 'security');
    assert.equal(game.state().wireless.ssid, 'SMKN1-Amuntai');
    assert.equal(game.state().wireless.security, 'default');
    assert.equal(game.state().security, null);
    assert.equal(game.state().hotspot, null);
    assert.equal(game.state().initialLogin, false);
    assert.deepEqual(game.state().profiles, {});
});

test('portal requires export, Notepad save, confirmed upload and reconnecting the HP', () => {
    const game = boot({ ...wifiState('portal'), hotspot, hotspotConfirmed: true, initialLogin: true });
    const transfer = (text) => ({ getData: () => text });
    game.get('.ch2-workbench').emit('drop', { dataTransfer: transfer('router-login-html') });
    assert.equal(game.state().exported, true);
    const desktopFile = game.get('[data-pc-desktop]').children[0];
    const menu = game.get('[data-pc-desktop]').children[1];
    desktopFile.emit('contextmenu'); menu.emit('click');
    game.get('[data-login-html]').value = '<div align="center"><h1>Wrong school</h1><form></form></div>';
    game.click('[data-save-html]');
    assert.equal(game.state().edited, false);
    game.dismiss();
    game.get('[data-login-html]').value = '<div align="center">\n<h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>\n<form name="login"></form>\n</div>';
    game.click('[data-save-html]');
    assert.equal(game.state().edited, true);
    assert.equal(game.state().uploaded, false);
    game.get('[data-upload-login]').emit('drop', { dataTransfer: transfer('desktop-login-html') });
    assert.equal(game.state().uploaded, false);
    game.dismiss();
    assert.equal(game.state().uploaded, true);
    assert.equal(game.state().portalVerified, false);
    game.click('[data-phone-network]'); game.get('[data-wifi-password]').value = 'Sekolah123'; game.submit('[data-wifi-connect]');
    assert.equal(game.state().portalVerified, true);
    assert.match(game.get('[data-portal-heading]').textContent, /SMK Negeri 1 Amuntai/);
    game.flush(); game.begin();
    assert.equal(game.state().stage, 'profiles');
});

test('all seven Chapter 4 missions require configuration, HP login, an edited upload and individual account tests before evaluation', () => {
    const earlier = {
        'netguard.chapter-one.v1.42': { identityInput: 'Router', identitySaved: true, interfaceNames: { ether1: 'ether1-internet', ether2: 'ether2-vlan', ether3: 'ether3-local' } },
        'netguard.chapter-two.v2.42': { identity: 'Router', vlan: { student: true, teacher: true }, addresses: { local: true, student: true, teacher: true, wireless: true }, pools: { local: '192.168.100.2-192.168.100.254', wireless: '192.168.20.10-192.168.20.50' }, wan: true },
        'netguard.chapter-three.v1.42': { dns: { servers: ['8.8.8.8', '8.8.4.4'], remote: true }, nat: { chain: 'srcnat', out: 'ether1-internet', action: 'masquerade', disabled: false } },
    };
    const game = boot(null, earlier);
    const next = (stage) => { game.flush(); game.begin(); assert.equal(game.state().stage, stage); };
    for (let count = 0; count < 5; count++) game.click('[data-ch2-prologue]'); game.begin();
    game.click('[data-open-window="wireless"]'); game.click('[data-wlan-row]'); game.click('[data-enable-wlan]');
    game.get('[data-wlan-row]').emit('dblclick'); game.click('[data-radio-tab="wireless"]');
    game.setField('mode', 'ap bridge'); game.setField('ssid', 'WiFi Lab Sekolah'); game.click('[data-save-form="wireless-edit"]'); next('security');
    game.click('[data-wireless-tab="security"]'); game.click('[data-add-security]');
    for (const [name, value] of [['security-name', 'aman-lab'], ['security-mode', 'dynamic keys'], ['wpa-key', 'RahasiaLab123'], ['wpa2-key', 'RahasiaLab123']]) game.setField(name, value);
    game.get('[data-field="wpa"]').checked = true; game.get('[data-field="wpa2"]').checked = true;
    game.click('[data-save-form="security-edit"]');
    game.click('[data-wireless-tab="interfaces"]'); game.get('[data-wlan-row]').emit('dblclick'); game.click('[data-radio-tab="wireless"]');
    game.setField('security', 'aman-lab'); game.click('[data-save-form="wireless-edit"]'); next('hotspot');
    game.click('[data-open-window="hotspot"]'); game.click('[data-hotspot-setup]');
    assert.equal(game.get('[data-setup-select]').value, 'ether1-internet');
    for (const [index, value] of ['wlan1', '192.168.20.1/24', '192.168.20.10-192.168.20.50', 'none', '0.0.0.0', '8.8.8.8,8.8.4.4', 'portal.sekolah.sch.id'].entries()) {
        game.get(index === 0 || index === 3 ? '[data-setup-select]' : '[data-setup-input]').value = value; game.click('[data-setup-next]');
    }
    game.get('[data-setup-credential="name"]').value = 'admin'; game.get('[data-setup-credential="password"]').value = 'admin'; game.click('[data-setup-next]');
    assert.equal(game.get('[data-setup-back]').hidden, true);
    assert.equal(game.get('[data-setup-cancel]').hidden, true);
    assert.equal(game.state().stage, 'hotspot');
    game.click('[data-setup-next]'); next('connect');
    game.click('[data-open-phone]'); game.click('[data-phone-open-wifi]'); game.click('[data-phone-network]');
    game.get('[data-wifi-password]').value = 'RahasiaLab123'; game.submit('[data-wifi-connect]');
    assert.match(game.get('[data-phone-status]').textContent, /192\.168\.20\.10/);
    assert.equal(game.state().hotspot.dnsName, 'portal.sekolah.sch.id');
    assert.equal(game.get('[data-portal-address]').textContent, 'portal.sekolah.sch.id/login');
    game.get('[data-phone-user]').value = 'admin'; game.get('[data-phone-password]').value = 'admin'; game.submit('[data-phone-login]'); next('portal');
    game.get('.ch2-workbench').emit('drop', { dataTransfer: { getData: () => 'router-login-html' } });
    const desktop = game.get('[data-pc-desktop]'); desktop.children[0].emit('contextmenu'); desktop.children[1].emit('click');
    assert.match(game.get('[data-login-html]').value, /action="\$\(link-login-only\)"/);
    game.get('[data-login-html]').value = game.get('[data-login-html]').value.replace('<div align="center">', '<div align="center">\n<h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>');
    game.click('[data-save-html]');
    game.get('[data-upload-login]').emit('drop', { dataTransfer: { getData: () => 'desktop-login-html' } });
    assert.equal(game.state().uploaded, false); game.dismiss(); assert.equal(game.state().uploaded, true);
    game.click('[data-phone-forget]'); game.click('[data-phone-network]'); game.get('[data-wifi-password]').value = 'RahasiaLab123'; game.submit('[data-wifi-connect]'); next('profiles');
    game.click('[data-hotspot-tab="User Profiles"]');
    for (const [name, shared, rate] of [['kepalasekolah', 1, '512k/512k'], ['guru', 10, '256k/256k'], ['siswa', 5, '128k/128k']]) {
        game.click('[data-hotspot-add]'); game.setField('profile-name', name); game.setField('shared', String(shared)); game.setField('rate', rate); game.click('[data-save-form="profile-edit"]');
    }
    next('users'); game.click('[data-hotspot-tab="Users"]');
    for (const [name, password] of [['kepalasekolah', '123'], ['guru', '456'], ['siswa', '789']]) {
        game.click('[data-hotspot-add]'); game.setField('user-name', name); game.setField('user-password', password); game.setField('user-profile', name); game.click('[data-save-form="user-edit"]');
        assert.equal(game.get('[data-quiz-dialog]').open, false);
        game.click('[data-phone-logout]'); game.get('[data-phone-user]').value = name; game.get('[data-phone-password]').value = password; game.submit('[data-phone-login]');
        game.click('[data-hotspot-tab="Active"]'); game.get('[data-hotspot-table]').children[1].emit('click'); game.click('[data-hotspot-tab="Users"]');
    }
    game.flush(); game.dismiss();
    assert.equal(game.state().stage, 'quiz'); assert.equal(game.get('[data-quiz-dialog]').open, true);
    for (const [key, value] of Object.entries(earlier)) assert.deepEqual(JSON.parse(game.storage.get(key)), value);
});

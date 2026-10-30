const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/chapter-four-simulation.js'), 'utf8'), context);
const model = context.window.NetGuardChapterFour;
const ready = () => ({
    wireless: { enabled: true, mode: 'ap bridge', ssid: 'SMKN1-Amuntai', security: 'user' },
    security: { name: 'user', mode: 'dynamic keys', wpa: true, wpa2: true, key: 'Sekolah123', key2: 'Sekolah123' },
    hotspot: { interface: 'wlan1', dnsName: 'hotspot-tkj.com', user: 'admin', password: 'admin' }, phoneConnected: true,
    profiles: Object.fromEntries(Object.entries(model.parameters.profiles).map(([name, target]) => [name, { shared: target.shared, rate: target.rate }])),
    users: Object.fromEntries(Object.entries(model.parameters.profiles).map(([name, target]) => [name, { profile: name, password: target.password }])),
});
test('WiFi needs an enabled access point and applied security profile', () => {
    const state = ready();
    assert.equal(model.wifiReady(state), true);
    for (const [field, incorrect] of [['enabled', false], ['mode', 'station'], ['ssid', 'MikroTik'], ['security', 'default']]) {
        const wrong = { ...state, wireless: { ...state.wireless, [field]: incorrect } };
        assert.equal(model.wifiReady(wrong), false);
        assert.equal(model.authenticate(wrong, 'admin', 'admin').reason, 'wifi');
    }
    for (const field of ['wpa', 'wpa2']) assert.equal(model.securityValid({ security: { ...state.security, [field]: false } }), false);
});
test('WiFi password cannot authenticate the portal and HotSpot must run on wlan1', () => {
    const state = ready();
    assert.equal(model.authenticate(state, 'admin', 'admin').ok, true);
    assert.equal(model.authenticate(state, 'admin', 'Sekolah123').ok, false);
    state.phoneConnected = false;
    assert.equal(model.authenticate(state, 'admin', 'admin').reason, 'wifi');
    state.phoneConnected = true; state.hotspot.interface = 'ether3-local';
    assert.equal(model.authenticate(state, 'admin', 'admin').reason, 'hotspot');
});
test('source profiles and accounts enforce correct rate and concurrent sessions', () => {
    const state = ready();
    for (const [name, target] of Object.entries(model.parameters.profiles)) {
        assert.equal(model.userValid(state, name), true);
        const login = model.authenticate(state, name, target.password);
        assert.equal(login.ok, true); assert.equal(login.rate, target.rate); assert.equal(login.shared, target.shared);
        assert.equal(model.authenticate(state, name, target.password, target.shared).reason, 'sessions');
        assert.equal(model.authenticate(state, name, target.password, target.shared - 1).ok, true);
    }
    state.users.siswa.profile = 'guru';
    assert.equal(model.authenticate(state, 'siswa', '789').ok, false);
    state.profiles.guru.rate = '128k/128k';
    assert.equal(model.authenticate(state, 'guru', '456').ok, false);
});
test('welcome heading must appear below the centered div', () => {
    assert.equal(model.loginHtmlValid('<div align="center">\n<h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>\n<form></form></div>'), true);
    assert.equal(model.loginHtmlValid('<div align="center">Selamat Datang di Hotspot SMK Negeri 1 Amuntai</div>'), false);
    assert.equal(model.loginHtmlValid('<h1>Selamat Datang di Hotspot SMK Negeri 1 Amuntai</h1>'), false);
});

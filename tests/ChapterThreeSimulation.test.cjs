const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-simulation.js'), 'utf8'), context);
const model = context.window.NetGuardChapterThree;
const readyState = () => ({
    wan: { link: true, bound: true, defaultRoute: true },
    dns: { servers: ['8.8.8.8', '8.8.4.4'], remote: true },
    nat: { chain: 'srcnat', out: 'ether1-internet', action: 'masquerade', disabled: false },
    lan: {
        student: { ready: true, pool: '192.168.40.10-192.168.40.50', address: '192.168.40.10', gateway: '192.168.40.1' },
        teacher: { ready: true, pool: '192.168.60.10-192.168.60.50', address: '192.168.60.10', gateway: '192.168.60.1' },
    },
});
test('terminal accepts the Google domain shown in the instructions, including capital letters', () => {
    const source = fs.readFileSync(path.join(__dirname, '../public/js/chapter-three-workbench.js'), 'utf8');
    const expression = source.match(/const match = command\.match\((.+)\);/)[1];
    const pattern = vm.runInNewContext(expression);
    for (const command of ['ping google.com count=4', 'ping Google.com count=4', '/tool/ping address=google.com count=4']) {
        const match = command.match(pattern);
        assert.ok(match, command);
        assert.equal(model.routerTest(readyState(), match[1].toLowerCase()).kind, 'domain');
    }
});
test('router IP test does not depend on DNS or NAT', () => {
    const state = readyState(); state.dns.servers = []; state.nat = null;
    assert.equal(model.routerTest(state, '8.8.8.8').ok, true);
    assert.equal(model.routerTest(state, 'google.com').reason, 'dns');
});
test('router DNS works without serving remote DNS, but client DNS does not', () => {
    const state = readyState(); state.dns.remote = false;
    assert.equal(model.routerTest(state, 'google.com').ok, true);
    assert.equal(model.clientTest(state, 'student').reason, 'remote');
});
test('WAN failures identify link, DHCP and default route in order', () => {
    const state = readyState();
    for (const [field, reason] of [['link', 'link'], ['bound', 'wan'], ['defaultRoute', 'route']]) {
        state.wan[field] = false; assert.equal(model.routerTest(state, '8.8.8.8').reason, reason); assert.equal(model.wanReady(state), false); state.wan[field] = true;
    }
});
test('DNS resolver list must contain both distinct module addresses', () => {
    const state = readyState();
    for (const servers of [[], ['8.8.8.8'], ['8.8.8.8', '8.8.8.8'], ['1.1.1.1', '8.8.8.8']]) { state.dns.servers = servers; assert.equal(model.dnsValid(state), false); }
    state.dns.servers = ['8.8.4.4', '8.8.8.8']; assert.equal(model.dnsValid(state), true);
});
test('NAT must be active srcnat masquerade on the WAN interface', () => {
    const state = readyState();
    for (const patch of [{ disabled: true }, { out: 'ether2-vlan' }, { chain: 'dstnat' }, { action: 'accept' }]) { const invalid = { ...state, nat: { ...state.nat, ...patch } }; assert.equal(model.clientTest(invalid, 'student').reason, 'nat'); assert.equal(model.routerTest(invalid, '8.8.8.8').ok, true); }
});
test('client verification rejects wrong VLAN, gateway and pool addresses', () => {
    for (const patch of [{ address: '192.168.60.10' }, { gateway: '192.168.60.1' }, { address: '192.168.40.51' }, { pool: '192.168.40.1-192.168.40.50' }, { ready: false }]) { const state = readyState(); Object.assign(state.lan.student, patch); assert.equal(model.clientTest(state, 'student').reason, 'lan'); }
});
test('both clients succeed with correct configuration; changing NAT breaks them', () => {
    const state = readyState();
    for (const group of ['student', 'teacher']) assert.equal(model.clientTest(state, group).ok, true);
    state.nat.disabled = true;
    for (const group of ['student', 'teacher']) assert.equal(model.clientTest(state, group).ok, false);
});
test('PC commands inspect DHCP configuration and test IP separately from DNS', () => {
    const state = readyState();
    assert.equal(model.clientCommand(state, 'student', 'ipconfig /all').ok, true);
    state.dns.servers = [];
    assert.equal(model.clientCommand(state, 'student', 'ping 8.8.8.8').ok, true);
    assert.equal(model.clientCommand(state, 'student', 'ping Google.com -n 4').reason, 'dns');
    state.dns.servers = ['8.8.8.8', '8.8.4.4'];
    assert.equal(model.clientCommand(state, 'student', 'ping google.com').kind, 'domain');
    state.nat.disabled = true;
    assert.equal(model.clientCommand(state, 'student', 'ping 8.8.8.8').reason, 'nat');
    assert.equal(model.clientCommand(state, 'student', 'ipconfig').ok, true);
    state.lan.student.ready = false;
    assert.equal(model.clientCommand(state, 'student', 'ipconfig /all').ok, false);
    assert.equal(model.clientCommand(state, 'student', 'ping google.com').reason, 'lan');
    assert.equal(model.clientCommand(state, 'teacher', 'anything').reason, 'command');
});
test('the original configuration PC uses ether3-local subnet and the local DHCP range', () => {
    const state = readyState();
    state.lan.local = { ready: true, address: '192.168.100.2', gateway: '192.168.100.1', pool: '192.168.100.2-192.168.100.254' };
    assert.equal(model.clientCommand(state, 'local', 'ipconfig /all').ok, true);
    assert.equal(model.clientCommand(state, 'local', 'ping google.com').ok, true);
    state.lan.local.address = '192.168.40.10';
    assert.equal(model.clientCommand(state, 'local', 'ipconfig /all').ok, false);
});

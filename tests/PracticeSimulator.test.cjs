const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/practice-simulator.js'), 'utf8'), context);
const api = context.window.NetGuardPracticeSimulator;
const { initial } = require('./PracticeFixture.cjs');
const make = () => api.create(initial());

test('interface details derive flags from cable and bridge membership and do not manufacture hardware', () => {
    const game = make();
    assert.equal(game.interfaceDetails('interfaces', 2).flags, 'R');
    assert.equal(game.interfaceDetails('interfaces', 0).linkStatus, 'no link');
    game.save('bridges', { name: 'bridge-studio' }); game.save('bridgePorts', { interface: 'ether3', bridge: 'bridge-studio' });
    assert.equal(game.interfaceDetails('interfaces', 2).flags, 'RS');
    game.toggle('interfaces', 2, true); assert.equal(game.interfaceDetails('interfaces', 2).flags, 'X');
    assert.equal(game.interfaceDetails('interfaces', 2).rate, '');
    assert.throws(() => game.remove('interfaces', 2), /tidak dapat dihapus/);
    assert.notEqual(game.draft('interfaces', 0).mac, game.draft('interfaces', 1).mac);
});

test('all interface selectors include virtual interfaces and names remain unique across interface types', () => {
    const game = make();
    game.save('bonding', { name: 'bond-studio', slaves: ['ether1', 'ether2'] });
    game.save('eoip', { name: 'tunnel-studio', remoteAddress: '203.0.113.3', tunnelId: 21 });
    assert.ok(game.options({ source: 'interfaces' }).includes('bond-studio'));
    assert.ok(game.options({ source: 'interfaces' }).includes('tunnel-studio'));
    assert.throws(() => game.save('vlans', { name: 'ether1', vlanId: 211 }), /nama sudah digunakan/);
    assert.equal(game.interfaceEntries().find((entry) => entry.row.name === 'bond-studio').row.type, 'Bonding');
});

test('all CP1–CP5 configuration collections are editable without mission progression gates', () => {
    const game = make();
    for (const table of ['interfaces', 'vlans', 'wan', 'addresses', 'dhcp', 'pools', 'networks', 'nat', 'routes', 'wireless', 'security', 'hotspot', 'hotspotProfiles', 'profiles', 'users', 'bridges', 'bridgePorts', 'bridgeVlans', 'switchPorts', 'switchVlans']) {
        assert.ok(api.schemas[table], table);
        assert.ok(Array.isArray(game.state.tables[table]), table);
    }
    game.save('identity', { identity: 'Router-Bebas' });
    game.save('vlans', { name: 'vlan-studio', vlanId: '211', interface: 'ether2' });
    game.save('bridges', { name: 'bridge-studio', protocol: 'mstp', vlanFiltering: true });
    game.save('bridgePorts', { interface: 'ether2', bridge: 'bridge-studio' });
    assert.equal(game.state.identity, 'Router-Bebas');
    assert.equal(game.state.tables.vlans[0].vlanId, 211);
    assert.equal(game.state.tables.bridges[0].protocol, 'mstp');
    assert.equal(game.state.tables.bridgePorts[0].bridge, 'bridge-studio');
});

test('configuration accepts valid alternatives without leaking expected case answers', () => {
    const game = make();
    game.save('addresses', { address: '10.19.12.1/24', interface: 'ether2' });
    game.save('nat', { chain: 'dstnat', action: 'dst-nat', outInterface: 'ether2' });
    game.save('wireless', { ssid: 'Bukan-Jawaban', mode: 'station', securityProfile: 'studio' }, 0);
    assert.equal(game.state.tables.addresses[1].address, '10.19.12.1/24');
    assert.equal(game.state.tables.nat[1].action, 'dst-nat');
    assert.equal(game.state.tables.wireless[0].ssid, 'Bukan-Jawaban');
    assert.throws(() => game.save('vlans', { vlanId: 5000 }), /rentang/);
    assert.throws(() => game.save('addresses', { address: '999.1.1.1/24' }), /alamat\/prefix yang valid/);
});

test('DHCP setup persists pool, network and a server referencing that pool', () => {
    const game = make();
    game.state.tables.dhcp = []; game.state.tables.pools = []; game.state.tables.networks = [];
    game.setupDhcp({ interface: 'ether3', network: '172.22.91.0/24', gateway: '172.22.91.1', pool: '172.22.91.60-172.22.91.95', dns: ['172.22.91.1'], leaseTime: '00:20:00' });
    assert.equal(game.state.tables.dhcp[0].pool, game.state.tables.pools[0].name);
    assert.equal(game.state.tables.dhcp[0].leaseTime, '00:20:00');
    assert.equal(game.state.tables.networks[0].dns[0], '172.22.91.1');
    assert.match(game.command('ipconfig'), /172\.22\.91\.60/);
});

test('disabled DHCP and disconnected cables do not count as successful IP checks', () => {
    const game = make();
    game.state.physical.pcPort = '';
    assert.match(game.command('ipconfig'), /Media disconnected/);
    assert.equal(game.state.tests.pcIp, undefined);
    game.state.physical.pcPort = 'ether3';
    game.toggle('dhcp', 0, true);
    assert.match(game.command('ipconfig'), /0\.0\.0\.0/);
    assert.equal(game.state.tests.pcIp, undefined);
    game.toggle('dhcp', 0, false);
    game.command('ipconfig');
    assert.equal(game.state.tests.pcIp, '172.22.91.60');
});

test('router and PC ping track their own source and require live networking', () => {
    const game = make();
    assert.match(game.command('ping 9.9.9.9', 'router'), /Reply from/);
    assert.equal(game.state.tests.routerPing, '9.9.9.9');
    assert.match(game.command('ping 172.22.91.1', 'pc'), /Reply from/);
    assert.equal(game.state.tests.pcPing, '172.22.91.1');
    game.toggle('wan', 0, true);
    assert.match(game.command('ping 149.112.112.112', 'router'), /timed out/);
    assert.equal(game.state.tests.routerPing, '9.9.9.9');
});

test('HotSpot wizard creates the server, profile, pool and initial user', () => {
    const game = make();
    game.setupHotspot({ interface: 'wlan1', localAddress: '172.22.91.1/24', pool: '172.22.91.60-172.22.91.95', dns: ['9.9.9.9'], dnsName: 'portal-nieuw.test', username: 'gast', password: 'Anders-123' });
    const server = game.state.tables.hotspot[1];
    assert.equal(server.dnsName, 'portal-nieuw.test');
    assert.ok(game.state.tables.hotspotProfiles.some((profile) => profile.name === server.profile));
    assert.ok(game.state.tables.pools.some((pool) => pool.name === server.addressPool));
    assert.ok(game.state.tables.users.some((user) => user.name === 'gast' && user.password === 'Anders-123'));
});

test('phone distinguishes Wi-Fi authentication from HotSpot authentication', () => {
    const game = make();
    assert.throws(() => game.loginPhone('peserta', 'Hotspot-Baru'), /Hubungkan/);
    assert.throws(() => game.connectPhone('Studio-Baru', 'salah'), /Password Wi-Fi salah/);
    game.connectPhone('Studio-Baru', 'Password-Baru');
    assert.equal(game.state.phone.authenticatedUser, '');
    assert.throws(() => game.loginPhone('peserta', 'Password-Baru'), /invalid/);
    game.loginPhone('peserta', 'Hotspot-Baru');
    assert.equal(game.state.phone.authenticatedUser, 'peserta');
});

test('row edits, deletion, enable and disable persist without Enter', () => {
    const game = make();
    const index = game.save('switchVlans', { switch: 'switch1', vlanId: 287, ports: ['ether1', 'ether3', 'ether4'] });
    game.save('switchVlans', { ports: ['ether1', 'ether4'] }, index);
    assert.equal(game.state.tables.switchVlans[index].ports.join(','), 'ether1,ether4');
    game.toggle('switchVlans', index, true);
    assert.equal(game.state.tables.switchVlans[index].disabled, true);
    game.remove('switchVlans', index);
    assert.equal(game.state.tables.switchVlans.length, 0);
});

test('practice snapshots do not mutate the initial scenario or Adventure storage', () => {
    const original = initial();
    const game = api.create(original);
    game.save('identity', { identity: 'Berbeda' });
    assert.equal(original.identity, 'MikroTik');
    const snapshot = game.snapshot(); snapshot.identity = 'Lain';
    assert.equal(game.state.identity, 'Berbeda');
});

test('native lease shorthand is normalized and interface renaming preserves its references', () => {
    const game = make();
    game.save('dhcp', { leaseTime: '20m' }, 0);
    assert.equal(game.state.tables.dhcp[0].leaseTime, '00:20:00');
    game.save('interfaces', { name: 'ether3-studio' }, 2);
    assert.equal(game.state.tables.dhcp[0].interface, 'ether3-studio');
    assert.equal(game.state.tables.addresses[0].interface, 'ether3-studio');
    assert.match(game.command('ipconfig'), /172\.22\.91\.60/);
});

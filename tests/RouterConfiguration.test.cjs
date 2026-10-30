const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/router-configuration.js'), 'utf8'), context);
const model = context.window.NetGuardRouterConfiguration;

test('missing chapter data does not fabricate VLANs, addresses, DHCP, DNS or NAT', () => {
    const config = model.fromStates();
    assert.equal(config.interfaces[0].name, 'ether1');
    assert.equal(config.interfaces[3].running, false);
    for (const name of ['vlans', 'addresses', 'dhcp']) assert.equal(config[name].length, 0);
    assert.equal(config.dns.servers.length, 0);
    assert.equal(config.nat, null);
    assert.equal(config.wan.exists, false);
    assert.equal(config.wan.bound, false);
    assert.equal(config.wan.defaultRoute, false);
});

test('later chapter views preserve disabled configurations, leases, pool ranges and DHCP options', () => {
    const one = { identityInput: 'Router', interfaceNames: { ether1: 'Internet', ether2: 'Switch', ether3: 'Lab' } };
    const two = { identity: 'Sekolah', vlan: { student: true, teacher: false }, addresses: { local: true, student: true }, addressDisabled: { student: true }, addressComments: { student: 'maintenance' }, pools: { local: '192.168.100.15-192.168.100.75' }, dhcpSettings: { local: { network: '192.168.100.0/24', gateway: '192.168.100.1', dns: '9.9.9.9', lease: '1h' } }, dhcpDisabled: { local: true }, clientLeases: { local: { address: '192.168.100.17' } }, wanClient: { bound: true, disabled: true, defaultRoute: 'yes', distance: 3 } };
    const three = { dns: { servers: ['9.9.9.9'], remote: false }, nat: { chain: 'srcnat', out: 'Internet', action: 'masquerade', disabled: true, packets: 55 } };
    const before = JSON.stringify([one, two, three]);
    const config = model.fromStates(one, two, three);
    assert.equal(config.identity, 'Sekolah');
    assert.equal(config.vlans.length, 1);
    assert.equal(config.vlans[0].parent, 'Switch');
    assert.equal(config.addresses[1].disabled, true);
    assert.equal(config.addresses[1].comment, 'maintenance');
    assert.equal(config.dhcp[0].pool, two.pools.local);
    assert.equal(config.dhcp[0].lease, '1h');
    assert.equal(config.dhcp[0].disabled, true);
    assert.equal(config.leases.local.address, '192.168.100.17');
    assert.equal(config.wan.bound, false);
    assert.equal(config.wan.defaultRoute, false);
    assert.equal(config.dns.remote, false);
    assert.equal(config.nat.disabled, true);
    assert.equal(config.nat.packets, 55);
    assert.equal(JSON.stringify([one, two, three]), before);
});

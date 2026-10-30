(() => {
    'use strict';

    const segments = { local: [100, 'ether3'], student: [40, 'vlan1-siswa'], teacher: [60, 'vlan2-guru'], wireless: [20, 'wlan1'] };
    const fromStates = (one = {}, two = {}, three = {}) => {
        one ||= {}; two ||= {}; three ||= {};
        const names = { ether1: 'ether1', ether2: 'ether2', ether3: 'ether3', ...one.interfaceNames, ...two.interfaces };
        const interfaces = Object.entries(names).map(([id, name]) => ({ id, name, type: 'Ethernet', mtu: 1500, running: true }));
        interfaces.push({ id: 'ether4', name: 'ether4', type: 'Ethernet', mtu: 1500, running: false });
        interfaces.push({ id: 'wlan1', name: 'wlan1', type: 'Wireless', mtu: 1500, running: false });
        const vlans = Object.entries({ student: [10, 'vlan1-siswa'], teacher: [20, 'vlan2-guru'] }).filter(([group]) => two.vlan?.[group]).map(([group, [id, name]]) => ({ group, id, name, parent: names.ether2 }));
        interfaces.push(...vlans.map((vlan) => ({ id: vlan.name, name: vlan.name, type: 'VLAN', mtu: 1500, running: true })));
        const addresses = Object.entries(segments).filter(([group]) => two.addresses?.[group]).map(([group, [prefix, port]]) => ({ group, address: `192.168.${prefix}.1/24`, network: `192.168.${prefix}.0`, interface: names[port] || port, disabled: Boolean(two.addressDisabled?.[group]), comment: two.addressComments?.[group] || '' }));
        const dhcp = Object.entries(segments).filter(([group]) => two.pools?.[group]).map(([group, [prefix, port]], index) => ({ group, name: `dhcp${index + 1}`, interface: names[port] || port, pool: two.pools[group], network: two.dhcpSettings?.[group]?.network || `192.168.${prefix}.0/24`, gateway: two.dhcpSettings?.[group]?.gateway || `192.168.${prefix}.1`, dns: two.dhcpSettings?.[group]?.dns || '', lease: two.dhcpSettings?.[group]?.lease || '10m', disabled: Boolean(two.dhcpDisabled?.[group]) }));
        const client = two.wanClient || (two.wan ? { bound: true, disabled: false, defaultRoute: 'yes', distance: 1 } : null);
        const bound = Boolean(client && !client.disabled && (three.wan?.bound ?? client.bound));
        const wan = { exists: Boolean(client), interface: names.ether1, bound, defaultRoute: bound && (three.wan?.defaultRoute ?? client?.defaultRoute !== 'no'), distance: client?.distance ?? 1, disabled: Boolean(client?.disabled), client };
        return { identity: two.identity || (one.identitySaved ? 'Router' : one.identityInput) || 'MikroTik', names, interfaces, vlans, addresses, dhcp, leases: { ...two.clientLeases }, wan, dns: three.dns || { servers: [], remote: false }, nat: three.nat || null, hasPreviousConfiguration: Boolean(Object.keys(one).length || Object.keys(two).length || Object.keys(three).length) };
    };
    const read = (userId, through = 3) => {
        const get = (key) => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };
        return fromStates(get('netguard.chapter-one.v1.' + userId), through >= 2 ? get('netguard.chapter-two.v2.' + userId) : null, through >= 3 ? get('netguard.chapter-three.v1.' + userId) : null);
    };
    const rows = (table, headers, records) => {
        if (!table) return;
        const head = document.createElement('div'); head.className = 'ch2-table__head';
        head.hidden = headers.length === 0;
        for (const text of headers) { const cell = document.createElement('span'); cell.textContent = text; head.append(cell); }
        const body = records.map((record) => {
            const row = document.createElement('div');
            for (const value of record) { const cell = document.createElement('span'); cell.textContent = String(value); cell.title = String(value); row.append(cell); }
            return row;
        });
        table.replaceChildren(head, ...body);
    };
    const render = (root, configuration, wireless = null) => {
        if (!root?.querySelector) return;
        const pane = (name) => root.querySelector('[data-window="' + name + '"]');
        const set = (selector, value, property = 'textContent') => { const node = root.querySelector(selector); if (node) node[property] = value; };
        root.querySelectorAll('[data-router-identity]').forEach((node) => { node.textContent = configuration.identity; });
        set('[data-inherited-identity]', configuration.identity, 'value');
        const items = configuration.interfaces.map((item) => item.id === 'wlan1' && wireless ? { ...item, running: wireless.enabled && wireless.mode === 'ap bridge' } : item);
        const interfacePane = pane('interfaces');
        const renderInterfaces = (table, records) => {
            if (!table) return;
            const native = table.hasAttribute('data-native-interfaces');
            rows(table, native ? ['#', '', 'Name', 'Type', 'Actual MTU', 'L2 MTU', 'Tx', 'Rx', 'Tx Packet (p/s)', 'Rx Packet (p/s)', 'FP Tx', 'FP Rx'] : ['Name', 'Type', 'Actual MTU', 'Running'], records.map((item, index) => native ? [index, item.running ? 'R' : item.id === 'wlan1' && !wireless?.enabled ? 'X' : '', item.name, item.type, item.mtu, item.type === 'Wireless' ? '1600' : item.type === 'VLAN' ? '1594' : '1598', '0 bps', '0 bps', '0', '0', '0 bps', '0 bps'] : [item.name, item.type, item.mtu, item.running ? 'R' : item.id === 'wlan1' ? 'X' : '']));
            if (native) [...table.children].slice(1).forEach((row, index) => { row.dataset.inheritedInterface = records[index].id; row.tabIndex = 0; row.setAttribute('role', 'button'); });
        };
        renderInterfaces(interfacePane?.querySelector('[data-inherited-interfaces]'), items);
        renderInterfaces(interfacePane?.querySelector('[data-inherited-ethernet]'), items.filter((item) => item.type === 'Ethernet'));
        if (interfacePane?.querySelector('footer')) interfacePane.querySelector('footer').textContent = items.length + ' items';
        const vlanTable = root.querySelector('[data-inherited-vlans]');
        const nativeVlans = vlanTable?.hasAttribute('data-native-vlans');
        rows(vlanTable, nativeVlans ? ['#', 'Name', 'Type', 'MTU', 'Actual MTU', 'L2 MTU', 'VLAN ID', 'Interface', 'Tx', 'Rx', 'FP Tx', 'FP Rx'] : ['Name', 'VLAN ID', 'Interface', 'MTU'], configuration.vlans.map((item, index) => nativeVlans ? [index, item.name, 'VLAN', '1500', '1500', '1594', item.id, item.parent, '0 bps', '0 bps', '0 bps', '0 bps'] : [item.name, item.id, item.parent, '1500']));
        const addressPane = pane('addresses');
        rows(addressPane?.querySelector('[data-inherited-addresses]'), ['#', 'Address', 'Network', 'Interface'], configuration.addresses.map((item, index) => [index, (item.disabled ? 'X ' : '') + item.address, item.network, item.interface]));
        if (addressPane?.querySelector('footer')) addressPane.querySelector('footer').textContent = configuration.addresses.length + ' items';
        rows(root.querySelector('[data-inherited-dhcp]'), ['Name', 'Interface', 'Address Pool', 'Lease Time', 'DNS Servers'], configuration.dhcp.map((item) => [(item.disabled ? 'X ' : '') + item.name, item.interface, item.pool, item.lease, item.dns]));
        rows(root.querySelector('[data-inherited-pools]'), ['Name', 'Ranges', 'Next Pool'], [...configuration.dhcp.map((item, index) => ['dhcp_pool' + index, item.pool, 'none']), ...(configuration.extraPools || []).map((item) => [item.name, item.range, 'none'])]);
        rows(root.querySelector('[data-inherited-networks]'), ['Address', 'Gateway', 'DNS Servers'], configuration.dhcp.map((item) => [item.network, item.gateway, item.dns]));
        root.querySelectorAll('[data-inherited-wan-interface]').forEach((node) => { node.textContent = configuration.wan.interface; });
        const clientRow = root.querySelector('[data-inspect-wan="client"]');
        if (clientRow) clientRow.hidden = !configuration.wan.exists;
        const clientFooter = pane('wan')?.querySelector('footer');
        if (clientFooter) clientFooter.textContent = configuration.wan.exists ? '1 item' : '0 items';
        const route = root.querySelector('[data-default-route]');
        if (route) route.hidden = !configuration.wan.defaultRoute;
        set('[data-wan-status]', configuration.wan.bound ? 'bound' : configuration.wan.disabled ? 'disabled' : 'searching');
        set('[data-wan-address]', configuration.wan.bound ? '192.0.2.2/24' : '0.0.0.0');
        set('[data-inherited-default-route]', configuration.wan.client?.defaultRoute || 'no');
        set('[data-inherited-route-gateway]', '192.0.2.1%' + configuration.wan.interface);
        rows(root.querySelector('[data-inherited-connected-routes]'), [], configuration.addresses.filter((item) => !item.disabled).map((item) => ['DAC', item.network + '/24', item.interface, '0']));
        set('[data-route-count]', configuration.addresses.filter((item) => !item.disabled).length + Number(configuration.wan.defaultRoute) + ' items');
    };
    const bind = (root) => root.querySelectorAll('[data-inherited-tab]').forEach((button) => button.addEventListener('click', () => {
        const section = button.closest('[data-window]');
        for (const name of ['interfaces', 'ethernet', 'lists', 'eoip', 'ipip', 'gre', 'vlans', 'vxlan', 'vrrp', 'bonding', 'lte', 'dhcp', 'networks']) {
            const panel = section.querySelector('[data-inherited-' + name + ']');
            if (panel) panel.hidden = name !== button.dataset.inheritedTab;
        }
        section.querySelectorAll('[data-inherited-tab]').forEach((tab) => tab.classList.toggle('is-active', tab === button));
    }));
    window.NetGuardRouterConfiguration = { fromStates, read, render, bind };
})();

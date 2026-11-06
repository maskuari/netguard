const initial = () => ({
    identity: 'MikroTik', device: 'hAP lite', session: { connected: true, mac: '48:A9:8A:2C:07:71' },
    dns: { servers: ['9.9.9.9'], allowRemoteRequests: true },
    tables: {
        interfaces: [1, 2, 3, 4, 5].map((port) => ({ defaultName: 'ether' + port, name: 'ether' + port, disabled: false })),
        wireless: [{ name: 'wlan1', ssid: 'Studio-Baru', mode: 'ap bridge', securityProfile: 'studio', disabled: false }],
        security: [{ name: 'studio', mode: 'dynamic keys', wpa2: true, key: 'Password-Baru', disabled: false }],
        wan: [{ interface: 'ether4', addDefaultRoute: true, disabled: false }], routes: [], nat: [{ chain: 'srcnat', action: 'masquerade', outInterface: 'ether4', disabled: false }],
        addresses: [{ address: '172.22.91.1/24', interface: 'ether3', disabled: false }],
        dhcp: [{ name: 'dhcp-studio', interface: 'ether3', pool: 'studio', disabled: false }],
        pools: [{ name: 'studio', ranges: '172.22.91.60-172.22.91.95', disabled: false }],
        networks: [{ address: '172.22.91.0/24', gateway: '172.22.91.1', dns: ['172.22.91.1'], disabled: false }],
        hotspot: [{ name: 'hotspot1', interface: 'wlan1', dnsName: 'studio.test', disabled: false }],
        users: [{ name: 'peserta', password: 'Hotspot-Baru', profile: 'default', disabled: false }],
        profiles: [{ name: 'default', sharedUsers: 1, disabled: false }],
    },
    physical: { powered: true, pcPort: 'ether3', pcLan: true }, files: { routerHtml: '<form></form>', desktopHtml: null }, phone: { ssid: '', authenticatedUser: '' }, tests: {},
});

module.exports = { initial };

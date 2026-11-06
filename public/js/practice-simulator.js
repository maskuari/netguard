(() => {
    'use strict';
    const field = (key, label, type = 'text', options = {}) => ({ key, label, type, tab: 'General', ...options });
    const interfaceField = (key = 'interface', label = 'Interface') => field(key, label, 'select', { source: 'interfaces' });
    const nameField = () => field('name', 'Name');
    const interfaceColumns = ['name', 'type', 'mtu', 'actualMtu', 'l2Mtu', 'tx', 'rx', 'fpTx', 'fpRx'];
    const ethernetModes = ['10M-baseT-half', '10M-baseT-full', '100M-baseT-half', '100M-baseT-full'];
    const interfaceTables = { interfaces: 'Ethernet', wireless: 'Wireless', vlans: 'VLAN', bridges: 'Bridge', eoip: 'EoIP Tunnel', ipip: 'IP Tunnel', gre: 'GRE Tunnel', vxlan: 'VXLAN', vrrp: 'VRRP', bonding: 'Bonding', lte: 'LTE' };
    const trafficFields = () => ['tx', 'rx', 'txPackets', 'rxPackets', 'fpTx', 'fpRx'].map((key) => field(key, ({ tx: 'Tx', rx: 'Rx', txPackets: 'Tx Packet (p/s)', rxPackets: 'Rx Packet (p/s)', fpTx: 'FP Tx', fpRx: 'FP Rx' })[key], 'text', { tab: 'Traffic', readonly: true, default: key.endsWith('Packets') ? '0' : '0 bps' }));
    const schemas = {
        identity: { title: 'Identity', singleton: true, fields: [field('identity', 'Identity')] },
        dns: { title: 'DNS Settings', singleton: true, fields: [field('servers', 'Servers', 'list'), field('dynamicServers', 'Dynamic Servers', 'text', { readonly: true }), field('allowRemoteRequests', 'Allow Remote Requests', 'checkbox'), field('maxUdp', 'Max UDP Packet Size', 'number', { default: 4096 }), field('cacheSize', 'Cache Size', 'text', { default: '2048 KiB' })] },
        interfaces: { title: 'Interface List', editTitle: 'Interface', columns: interfaceColumns, fields: [
            nameField(), field('type', 'Type', 'text', { readonly: true, default: 'Ethernet' }),
            field('mtu', 'MTU', 'number', { default: 1500, min: 68, max: 2028 }), field('actualMtu', 'Actual MTU', 'text', { readonly: true, default: 1500 }),
            field('l2Mtu', 'L2 MTU', 'number', { default: 1598, min: 1500, max: 2028 }), field('maxL2Mtu', 'Max L2 MTU', 'text', { readonly: true, default: 2028 }),
            field('mac', 'MAC Address', 'text', { readonly: true }), field('arp', 'ARP', 'select', { options: ['enabled', 'disabled', 'local-proxy-arp', 'proxy-arp', 'reply-only'], default: 'enabled' }), field('arpTimeout', 'ARP Timeout', 'text', { default: 'auto' }),
            field('autoNegotiation', 'Auto Negotiation', 'checkbox', { tab: 'Ethernet', default: true }), field('advertise', 'Advertise', 'checks', { tab: 'Ethernet', options: ethernetModes, default: ethernetModes }),
            field('speed', 'Speed', 'select', { tab: 'Ethernet', options: ethernetModes, default: '100M-baseT-full' }),
            field('txFlowControl', 'Tx Flow Control', 'select', { tab: 'Ethernet', options: ['off', 'on', 'auto'], default: 'off' }), field('rxFlowControl', 'Rx Flow Control', 'select', { tab: 'Ethernet', options: ['off', 'on', 'auto'], default: 'off' }),
            field('loopProtect', 'Loop Protect', 'select', { tab: 'Loop Protect', options: ['default', 'on', 'off'], default: 'default' }), field('loopProtectSendInterval', 'Loop Protect Send Interval', 'text', { tab: 'Loop Protect', default: '00:00:05' }), field('loopProtectDisableTime', 'Loop Protect Disable Time', 'text', { tab: 'Loop Protect', default: '00:05:00' }),
            field('linkStatus', 'Status', 'text', { tab: 'Status', readonly: true }), field('negotiationStatus', 'Auto Negotiation', 'text', { tab: 'Status', readonly: true }), field('rate', 'Rate', 'text', { tab: 'Status', readonly: true }),
            field('fullDuplex', 'Full Duplex', 'checkbox', { tab: 'Status', readonly: true }), field('activeTxFlowControl', 'Tx Flow Control', 'checkbox', { tab: 'Status', readonly: true }), field('activeRxFlowControl', 'Rx Flow Control', 'checkbox', { tab: 'Status', readonly: true }),
            field('advertising', 'Advertising', 'text', { tab: 'Status', readonly: true }), field('linkPartnerAdvertising', 'Link Partner Advertising', 'text', { tab: 'Status', readonly: true }), ...trafficFields(),
        ] },
        vlans: { title: 'Interface List', editTitle: 'New Interface', columns: ['name', 'vlanId', 'interface', 'mtu'], fields: [nameField(), field('mtu', 'MTU', 'number', { default: 1500 }), field('vlanId', 'VLAN ID', 'number', { min: 1, max: 4094 }), interfaceField(), field('useServiceTag', 'Use Service Tag', 'checkbox'), field('arp', 'ARP', 'select', { options: ['enabled', 'disabled', 'proxy-arp', 'reply-only'], default: 'enabled' })] },
        addresses: { title: 'Address List', editTitle: 'New Address', columns: ['address', 'network', 'interface'], fields: [field('address', 'Address', 'cidr'), field('network', 'Network', 'ip'), interfaceField()] },
        wan: { title: 'DHCP Client', editTitle: 'New DHCP Client', columns: ['interface', 'usePeerDns', 'addDefaultRoute', 'status', 'address'], fields: [interfaceField(), field('usePeerDns', 'Use Peer DNS', 'checkbox', { default: true }), field('usePeerNtp', 'Use Peer NTP', 'checkbox', { default: true }), field('addDefaultRoute', 'Add Default Route', 'checkbox', { default: true }), field('defaultRouteDistance', 'Default Route Distance', 'number', { default: 1 }), field('status', 'Status', 'text', { readonly: true, tab: 'Status' }), field('address', 'Address', 'text', { readonly: true, tab: 'Status' })] },
        dhcp: { title: 'DHCP Server', editTitle: 'New DHCP Server', columns: ['name', 'interface', 'leaseTime', 'pool'], fields: [nameField(), interfaceField(), field('leaseTime', 'Lease Time', 'text', { default: '00:10:00' }), field('pool', 'Address Pool', 'select', { source: 'pools' }), field('addArp', 'Add ARP For Leases', 'checkbox'), field('authoritative', 'Authoritative', 'select', { options: ['yes', 'no', 'after-2sec-delay', 'after-10sec-delay'], default: 'yes' })] },
        pools: { title: 'IP Pool', editTitle: 'New IP Pool', columns: ['name', 'ranges'], fields: [nameField(), field('ranges', 'Addresses', 'text'), field('nextPool', 'Next Pool', 'select', { source: 'pools', default: 'none', extras: ['none'] })] },
        networks: { title: 'DHCP Server', editTitle: 'New DHCP Network', columns: ['address', 'gateway', 'dns'], fields: [field('address', 'Address', 'cidr'), field('gateway', 'Gateway', 'ip'), field('netmask', 'Netmask', 'number', { default: 24 }), field('dns', 'DNS Servers', 'list'), field('domain', 'Domain'), field('ntp', 'NTP Servers', 'list'), field('wins', 'WINS Servers', 'list')] },
        leases: { title: 'DHCP Server', editTitle: 'New DHCP Lease', columns: ['address', 'mac', 'server', 'status'], fields: [field('address', 'Address', 'ip'), field('mac', 'MAC Address'), field('server', 'Server', 'select', { source: 'dhcp' }), field('comment', 'Comment')] },
        nat: { title: 'Firewall', editTitle: 'New NAT Rule', columns: ['action', 'chain', 'outInterface', 'bytes', 'packets'], fields: [field('chain', 'Chain', 'select', { options: ['srcnat', 'dstnat'], default: 'srcnat' }), field('srcAddress', 'Src. Address'), field('dstAddress', 'Dst. Address'), field('protocol', 'Protocol', 'select', { options: ['', 'tcp', 'udp', 'icmp', 'gre'] }), field('srcPort', 'Src. Port'), field('dstPort', 'Dst. Port'), interfaceField('inInterface', 'In. Interface'), interfaceField('outInterface', 'Out. Interface'), field('srcAddressList', 'Src. Address List', 'text', { tab: 'Advanced' }), field('dstAddressList', 'Dst. Address List', 'text', { tab: 'Advanced' }), field('comment', 'Comment', 'text', { tab: 'Extra' }), field('action', 'Action', 'select', { tab: 'Action', options: ['accept', 'masquerade', 'src-nat', 'dst-nat', 'redirect', 'netmap', 'drop', 'return', 'jump'], default: 'accept' }), field('toAddresses', 'To Addresses', 'text', { tab: 'Action' }), field('toPorts', 'To Ports', 'text', { tab: 'Action' }), field('log', 'Log', 'checkbox', { tab: 'Action' })] },
        routes: { title: 'Route List', editTitle: 'New Route', columns: ['dstAddress', 'gateway', 'distance', 'routingTable'], fields: [field('dstAddress', 'Dst. Address', 'cidr', { default: '0.0.0.0/0' }), field('gateway', 'Gateway'), field('distance', 'Distance', 'number', { default: 1 }), field('routingTable', 'Routing Table', 'select', { options: ['main'], default: 'main' }), field('checkGateway', 'Check Gateway', 'select', { options: ['none', 'ping', 'arp'], default: 'none' }), field('scope', 'Scope', 'number', { default: 30, tab: 'Attributes' }), field('targetScope', 'Target Scope', 'number', { default: 10, tab: 'Attributes' }), field('comment', 'Comment')] },
        wireless: { title: 'Wireless Tables', editTitle: 'Interface <wlan1>', columns: ['name', 'mode', 'ssid', 'securityProfile', 'tx', 'rx'], fields: [nameField(), field('mtu', 'MTU', 'number', { default: 1500 }), field('mode', 'Mode', 'select', { tab: 'Wireless', options: ['station', 'station bridge', 'station pseudobridge', 'ap bridge', 'bridge', 'alignment only', 'nstreme dual slave', 'wds slave'], default: 'station' }), field('band', 'Band', 'select', { tab: 'Wireless', options: ['2GHz-B/G', '2GHz-B/G/N', '2GHz-only-N'], default: '2GHz-B/G' }), field('channelWidth', 'Channel Width', 'select', { tab: 'Wireless', options: ['20MHz', '20/40MHz Ce', '20/40MHz eC'], default: '20MHz' }), field('frequency', 'Frequency', 'number', { tab: 'Wireless', default: 2412 }), field('ssid', 'SSID', 'text', { tab: 'Wireless', default: 'MikroTik' }), field('scanList', 'Scan List', 'text', { tab: 'Wireless', default: 'default' }), field('wirelessProtocol', 'Wireless Protocol', 'select', { tab: 'Wireless', options: ['any', '802.11', 'nstreme', 'nv2'], default: 'any' }), field('securityProfile', 'Security Profile', 'select', { tab: 'Wireless', source: 'security', default: 'default' }), field('wpsMode', 'WPS Mode', 'select', { tab: 'Wireless', options: ['disabled', 'push button'], default: 'push button' }), field('htTxChains', 'HT Tx Chains', 'list', { tab: 'HT', default: ['0', '1'] }), field('wdsMode', 'WDS Mode', 'select', { tab: 'WDS', options: ['disabled', 'dynamic', 'static'], default: 'disabled' }), field('nv2Security', 'Security', 'checkbox', { tab: 'NV2' }), field('running', 'Running', 'checkbox', { tab: 'Status', readonly: true }), field('tx', 'Tx', 'text', { tab: 'Traffic', readonly: true, default: '0 bps' })] },
        security: { title: 'Wireless Tables', editTitle: 'New Security Profile', columns: ['name', 'mode', 'wpa2'], fields: [nameField(), field('mode', 'Mode', 'select', { options: ['none', 'static keys optional', 'static keys required', 'dynamic keys'], default: 'none' }), field('wpa', 'WPA PSK', 'checkbox'), field('wpa2', 'WPA2 PSK', 'checkbox'), field('wpaEap', 'WPA EAP', 'checkbox'), field('wpa2Eap', 'WPA2 EAP', 'checkbox'), field('unicastCipher', 'Unicast Ciphers', 'list', { default: ['aes ccm'] }), field('groupCipher', 'Group Ciphers', 'list', { default: ['aes ccm'] }), field('wpaKey', 'WPA Pre-Shared Key', 'password'), field('key', 'WPA2 Pre-Shared Key', 'password'), field('supplicantIdentity', 'Supplicant Identity', 'text', { default: 'MikroTik' }), field('eapMethods', 'EAP Methods', 'list', { tab: 'EAP' }), field('radiusMacAuthentication', 'MAC Authentication', 'checkbox', { tab: 'RADIUS' })] },
        hotspot: { title: 'Hotspot', editTitle: 'New Hotspot Server', columns: ['name', 'interface', 'addressPool', 'profile', 'addressesPerMac'], fields: [nameField(), interfaceField(), field('addressPool', 'Address Pool', 'select', { source: 'pools', extras: ['none'], default: 'none' }), field('profile', 'Profile', 'select', { source: 'hotspotProfiles', extras: ['default'], default: 'default' }), field('idleTimeout', 'Idle Timeout', 'text', { default: '00:05:00' }), field('addressesPerMac', 'Addresses Per MAC', 'number', { default: 2 })] },
        hotspotProfiles: { title: 'Hotspot', editTitle: 'New Hotspot Server Profile', columns: ['name', 'dnsName', 'htmlDirectory'], fields: [nameField(), field('hotspotAddress', 'Hotspot Address', 'ip'), field('dnsName', 'DNS Name'), field('htmlDirectory', 'HTML Directory', 'text', { default: 'hotspot' }), field('httpPap', 'HTTP PAP', 'checkbox', { tab: 'Login' }), field('httpChap', 'HTTP CHAP', 'checkbox', { tab: 'Login', default: true }), field('cookie', 'Cookie', 'checkbox', { tab: 'Login', default: true }), field('useRadius', 'Use RADIUS', 'checkbox', { tab: 'RADIUS' })] },
        profiles: { title: 'Hotspot', editTitle: 'New Hotspot User Profile', columns: ['name', 'sharedUsers', 'rateLimit'], fields: [nameField(), field('addressPool', 'Address Pool', 'select', { source: 'pools', extras: ['none'], default: 'none' }), field('sessionTimeout', 'Session Timeout'), field('idleTimeout', 'Idle Timeout', 'text', { default: 'none' }), field('keepaliveTimeout', 'Keepalive Timeout', 'text', { default: '00:02:00' }), field('sharedUsers', 'Shared Users', 'number', { default: 1, min: 1 }), field('rateLimit', 'Rate Limit (rx/tx)'), field('addMacCookie', 'Add MAC Cookie', 'checkbox', { tab: 'Cookies', default: true }), field('onLogin', 'On Login', 'textarea', { tab: 'Scripts' }), field('onLogout', 'On Logout', 'textarea', { tab: 'Scripts' })] },
        users: { title: 'Hotspot', editTitle: 'New Hotspot User', columns: ['server', 'name', 'address', 'profile', 'uptime'], fields: [field('server', 'Server', 'select', { source: 'hotspot', extras: ['all'], default: 'all' }), nameField(), field('password', 'Password', 'password'), field('address', 'Address', 'ip'), field('mac', 'MAC Address'), field('profile', 'Profile', 'select', { source: 'profiles', default: 'default' }), field('limitUptime', 'Limit Uptime', 'text', { tab: 'Limits' }), field('limitBytesIn', 'Limit Bytes In', 'number', { tab: 'Limits', default: 0 }), field('limitBytesOut', 'Limit Bytes Out', 'number', { tab: 'Limits', default: 0 }), field('uptime', 'Uptime', 'text', { tab: 'Statistics', readonly: true, default: '00:00:00' })] },
        bridges: { title: 'Bridge', editTitle: 'New Interface', columns: ['name', 'type', 'l2Mtu', 'tx', 'rx'], fields: [nameField(), field('mtu', 'MTU', 'text', { default: 'auto' }), field('actualMtu', 'Actual MTU', 'text', { readonly: true, default: '1500' }), field('l2Mtu', 'L2 MTU', 'text', { readonly: true, default: '1598' }), field('arp', 'ARP', 'select', { options: ['enabled', 'disabled', 'proxy-arp', 'reply-only'], default: 'enabled' }), field('adminMac', 'Admin. MAC Address'), field('ageingTime', 'Ageing Time', 'text', { default: '00:05:00' }), field('igmpSnooping', 'IGMP Snooping', 'checkbox'), field('dhcpSnooping', 'DHCP Snooping', 'checkbox'), field('fastForward', 'Fast Forward', 'checkbox', { default: true }), field('protocol', 'Protocol Mode', 'select', { tab: 'STP', options: ['none', 'stp', 'rstp', 'mstp'], default: 'rstp' }), field('priority', 'Priority', 'text', { tab: 'STP', default: '8000' }), field('helloTime', 'Hello Time', 'text', { tab: 'STP', default: '00:00:02' }), field('forwardDelay', 'Forward Delay', 'text', { tab: 'STP', default: '00:00:15' }), field('vlanFiltering', 'VLAN Filtering', 'checkbox', { tab: 'VLAN' }), field('pvid', 'PVID', 'number', { tab: 'VLAN', default: 1 }), field('frameTypes', 'Frame Types', 'select', { tab: 'VLAN', options: ['admit-all', 'admit-only-vlan-tagged', 'admit-only-untagged-and-priority-tagged'], default: 'admit-all' }), field('running', 'Running', 'checkbox', { tab: 'Status', readonly: true }), field('tx', 'Tx', 'text', { tab: 'Traffic', readonly: true, default: '0 bps' })] },
        bridgePorts: { title: 'Bridge', editTitle: 'New Bridge Port', columns: ['interface', 'bridge', 'horizon', 'trusted', 'priority', 'pathCost'], fields: [interfaceField(), field('bridge', 'Bridge', 'select', { source: 'bridges' }), field('horizon', 'Horizon', 'text', { default: 'none' }), field('learn', 'Learn', 'select', { options: ['auto', 'yes', 'no'], default: 'auto' }), field('unknownUnicastFlood', 'Unknown Unicast Flood', 'checkbox', { default: true }), field('unknownMulticastFlood', 'Unknown Multicast Flood', 'checkbox', { default: true }), field('broadcastFlood', 'Broadcast Flood', 'checkbox', { default: true }), field('trusted', 'Trusted', 'checkbox'), field('hardwareOffload', 'Hardware Offload', 'checkbox', { default: true }), field('priority', 'Priority', 'text', { tab: 'STP', default: '80' }), field('pathCost', 'Path Cost', 'number', { tab: 'STP', default: 10 }), field('edge', 'Edge', 'select', { tab: 'STP', options: ['auto', 'yes', 'no'], default: 'auto' }), field('pvid', 'PVID', 'number', { tab: 'VLAN', default: 1 }), field('ingressFiltering', 'Ingress Filtering', 'checkbox', { tab: 'VLAN', default: true }), field('running', 'Running', 'checkbox', { tab: 'Status', readonly: true })] },
        switchPorts: { title: 'Switch', editTitle: 'Switch Port', columns: ['name', 'switch', 'mode', 'header', 'vlanId'], fields: [field('name', 'Name', 'text', { readonly: true }), field('switch', 'Switch', 'select', { options: ['switch1'], default: 'switch1' }), field('mode', 'VLAN Mode', 'select', { options: ['disabled', 'fallback', 'check', 'secure'], default: 'disabled' }), field('header', 'VLAN Header', 'select', { options: ['leave as is', 'always strip', 'add if missing'], default: 'leave as is' }), field('vlanId', 'Default VLAN ID', 'number', { min: 0, max: 4094, default: 0 })] },
        switchVlans: { title: 'Switch', editTitle: 'New Switch VLAN', columns: ['switch', 'vlanId', 'ports'], fields: [field('switch', 'Switch', 'select', { options: ['switch1'], default: 'switch1' }), field('vlanId', 'VLAN ID', 'number', { min: 0, max: 4094 }), field('ports', 'Ports', 'list', { source: 'switchPorts', extras: ['switch1-cpu'] }), field('independentLearning', 'Independent Learning', 'checkbox')] },
        bridgeVlans: { title: 'Bridge', editTitle: 'New Bridge VLAN', columns: ['bridge', 'vlanIds', 'tagged', 'untagged'], fields: [field('bridge', 'Bridge', 'select', { source: 'bridges' }), field('vlanIds', 'VLAN IDs', 'list'), field('tagged', 'Tagged', 'list', { source: 'interfaces' }), field('untagged', 'Untagged', 'list', { source: 'interfaces' })] },
    };
    schemas.ethernet = { ...schemas.interfaces };
    schemas.interfaceListNames = { title: 'Interface Lists', editTitle: 'New Interface List', columns: ['name', 'include', 'exclude'], fields: [nameField(), field('include', 'Include', 'list', { source: 'interfaceListNames', extras: ['all', 'dynamic', 'static', 'none'] }), field('exclude', 'Exclude', 'list', { source: 'interfaceListNames', extras: ['all', 'dynamic', 'static', 'none'] })] };
    schemas.interfaceLists = { title: 'Interface List', editTitle: 'New Interface List Member', columns: ['list', 'interface'], fields: [field('list', 'List', 'select', { source: 'interfaceListNames' }), interfaceField()] };
    for (const [key, title] of Object.entries({ eoip: 'EoIP Tunnel', ipip: 'IP Tunnel', gre: 'GRE Tunnel' })) {
        schemas[key] = { title: 'Interface List', editTitle: 'New Interface', columns: ['name', 'mtu', 'actualMtu', 'localAddress', 'remoteAddress'], fields: [nameField(), field('type', 'Type', 'text', { default: title, readonly: true }), field('mtu', 'MTU', 'text', { default: 'auto' }), field('actualMtu', 'Actual MTU', 'text', { readonly: true }), field('localAddress', 'Local Address', 'ip', { default: '0.0.0.0' }), field('remoteAddress', 'Remote Address', 'ip'), ...(key === 'eoip' ? [field('tunnelId', 'Tunnel ID', 'number', { default: 0, min: 0, max: 65535 })] : []), field('keepalive', 'Keepalive', 'text', { default: '10s,10' }), field('clampTcpMss', 'Clamp TCP MSS', 'checkbox', { default: true }), field('dontFragment', "Don't Fragment", 'select', { options: ['no', 'inherit'], default: 'no' }), field('ipsecSecret', 'IPsec Secret', 'password'), ...trafficFields()] };
    }
    schemas.vxlan = { title: 'Interface List', editTitle: 'New Interface', columns: ['name', 'vni', 'port', 'localAddress'], fields: [nameField(), field('vni', 'VNI', 'number', { min: 1, max: 16777215 }), field('port', 'Port', 'number', { default: 4789, min: 1, max: 65535 }), field('localAddress', 'Local Address', 'ip'), field('mtu', 'MTU', 'number', { default: 1500 }), ...trafficFields()] };
    schemas.vrrp = { title: 'Interface List', editTitle: 'New Interface', columns: ['name', 'interface', 'vrid', 'priority'], fields: [nameField(), interfaceField(), field('vrid', 'VRID', 'number', { default: 1, min: 1, max: 255 }), field('priority', 'Priority', 'number', { default: 100, min: 1, max: 254 }), field('version', 'Version', 'select', { options: ['2', '3'], default: '3' }), field('interval', 'Interval', 'text', { default: '1s' }), field('preemptionMode', 'Preemption Mode', 'checkbox', { default: true }), ...trafficFields()] };
    schemas.bonding = { title: 'Interface List', editTitle: 'New Interface', columns: ['name', 'mtu', 'slaves', 'mode'], fields: [nameField(), field('mtu', 'MTU', 'number', { default: 1500 }), field('slaves', 'Slaves', 'list', { source: 'interfaces' }), field('mode', 'Mode', 'select', { options: ['balance-rr', '802.3ad', 'active-backup', 'balance-xor', 'broadcast', 'balance-tlb', 'balance-alb'], default: 'balance-rr' }), field('primary', 'Primary', 'select', { source: 'interfaces' }), field('linkMonitoring', 'Link Monitoring', 'select', { options: ['mii', 'arp', 'none'], default: 'mii' }), field('miiInterval', 'MII Interval', 'text', { default: '100ms' }), field('arpInterval', 'ARP Interval', 'text', { default: '100ms' }), field('arpIpTargets', 'ARP IP Targets', 'list'), ...trafficFields()] };
    schemas.lte = { title: 'Interface List', editTitle: 'LTE Interface', columns: interfaceColumns, fields: [nameField(), field('apnProfiles', 'APN Profiles', 'text', { default: 'default' }), field('pin', 'PIN', 'password'), ...trafficFields()] };
    const extraSchemas = {
        filter: ['Firewall', ['chain', 'action', 'srcAddress', 'dstAddress']], mangle: ['Firewall', ['chain', 'action', 'srcAddress']], raw: ['Firewall', ['chain', 'action', 'srcAddress']], addressLists: ['Firewall', ['list', 'address', 'timeout']],
        bridgeMstis: ['Bridge', ['bridge', 'identifier', 'vlanIds', 'priority']], bridgeOverrides: ['Bridge', ['interface', 'identifier', 'pathCost', 'priority']], bridgeFilters: ['Bridge', ['chain', 'action', 'inInterface', 'outInterface']], bridgeNat: ['Bridge', ['chain', 'action', 'inInterface', 'outInterface']], bridgeHosts: ['Bridge', ['mac', 'interface', 'bridge']], bridgeMdb: ['Bridge', ['group', 'ports', 'bridge']],
        switchChips: ['Switch', ['name', 'type', 'mirrorSource', 'mirrorTarget']], switchIsolation: ['Switch', ['name', 'forwardingOverride']], switchHosts: ['Switch', ['mac', 'ports', 'vlanId']], switchRules: ['Switch', ['switch', 'ports', 'vlanId', 'newDstPorts']],
        hotspotActive: ['Hotspot', ['user', 'address', 'mac', 'uptime']], hotspotHosts: ['Hotspot', ['mac', 'address', 'toAddress', 'server']], hotspotBindings: ['Hotspot', ['mac', 'address', 'toAddress', 'server', 'type']], walledGarden: ['Hotspot', ['action', 'dstHost', 'dstPort']],
        queues: ['Queue List', ['name', 'target', 'maxLimit', 'limitAt']], radius: ['RADIUS', ['service', 'address', 'secret']], arp: ['ARP List', ['address', 'mac', 'interface']], services: ['IP Service List', ['name', 'port', 'address']], neighbors: ['Neighbor List', ['interface', 'address', 'mac', 'identity']],
        usersSystem: ['User List', ['name', 'group', 'address']], scheduler: ['Scheduler', ['name', 'startDate', 'startTime', 'interval', 'onEvent']], scripts: ['Script List', ['name', 'source']], logging: ['Logging', ['topics', 'action', 'prefix']],
    };
    for (const [key, [title, columns]] of Object.entries(extraSchemas)) schemas[key] = { title, editTitle: 'New ' + title, columns, fields: columns.map((column) => field(column, column.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()))) };

    const clone = (value) => JSON.parse(JSON.stringify(value));
    const isIp = (value) => /^\d{1,3}(\.\d{1,3}){3}$/.test(value) && value.split('.').every((part) => Number(part) <= 255);
    const subnet = (address) => String(address).split('/')[0].split('.').slice(0, 3).join('.');
    const duration = (value) => {
        const text = String(value).trim();
        const unit = text.match(/^(\d+)([smhdw])$/i), clock = text.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
        const seconds = unit ? Number(unit[1]) * ({ s: 1, m: 60, h: 3600, d: 86400, w: 604800 }[unit[2].toLowerCase()]) : clock ? clock[3] === undefined ? Number(clock[1]) * 60 + Number(clock[2]) : Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3]) : /^\d+$/.test(text) ? Number(text) : null;
        return seconds === null ? text : [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
    };
    const create = (initial) => {
        const state = clone(initial);
        for (const table of Object.keys(schemas)) if (!schemas[table].singleton) state.tables[table] ||= [];
        state.tables.hotspotProfiles ||= [];
        if (!state.tables.hotspotProfiles.length && state.tables.hotspot.length) state.tables.hotspotProfiles.push({ name: 'default', dnsName: state.tables.hotspot[0].dnsName, htmlDirectory: 'hotspot', disabled: false });
        if (!state.tables.switchChips.length) state.tables.switchChips.push({ name: 'switch1', type: 'QCA9533', disabled: false });
        const active = (table) => state.tables[table].filter((row) => !row.disabled);
        const options = (definition) => [...new Set([...(definition.options || []), ...(definition.extras || []), ...(definition.source === 'interfaces' ? Object.keys(interfaceTables).flatMap((key) => state.tables[key] || []).map((row) => row.name) : definition.source ? (state.tables[definition.source] || []).map((row) => row.name) : [])])];
        const interfaceDetails = (table, index) => {
            const row = state.tables[table][index], type = interfaceTables[table];
            const base = { type, mtu: 1500, actualMtu: 1500, l2Mtu: table === 'wireless' ? 1600 : 1598, ...row };
            const hardwareName = row.defaultName || row.name;
            const connectedPorts = [state.physical.pcLan ? state.physical.pcPort : '', ...Object.values(state.physical.connections || {})];
            let running = !row.disabled && (table === 'interfaces' ? connectedPorts.some((port) => port === hardwareName || port === row.name) : table === 'wireless' ? ['ap bridge', 'bridge'].includes(row.mode) : table === 'bridges' ? state.tables.bridgePorts.some((port) => port.bridge === row.name && !port.disabled) : row.running === true);
            if (table === 'vlans') {
                const parent = state.tables.interfaces.find((port) => port.name === row.interface);
                running = !row.disabled && Boolean(parent && !parent.disabled && connectedPorts.includes(parent.defaultName || parent.name));
                base.l2Mtu = 1594;
            }
            const slave = state.tables.bridgePorts.some((port) => port.interface === row.name && !port.disabled);
            const macParts = String(state.session.mac).split(':');
            macParts[5] = ((parseInt(macParts[5] || '0', 16) + index) % 256).toString(16).padStart(2, '0').toUpperCase();
            return { ...base, mac: row.mac || macParts.join(':'), actualMtu: base.mtu === 'auto' ? 1500 : base.mtu, running, flags: row.disabled ? 'X' : (running ? 'R' : '') + (slave ? 'S' : ''),
                linkStatus: running ? 'link ok' : 'no link', negotiationStatus: running ? row.autoNegotiation === false ? 'disabled' : 'done' : '',
                rate: running ? String(row.speed || '100M-baseT-full').startsWith('10M-') ? '10 Mbps' : '100 Mbps' : '', fullDuplex: running && !(row.speed || '').endsWith('-half'),
                advertising: (row.advertise || ethernetModes).join(', '), linkPartnerAdvertising: running ? ethernetModes.join(', ') : '',
                tx: row.tx || '0 bps', rx: row.rx || '0 bps', fpTx: row.fpTx || '0 bps', fpRx: row.fpRx || '0 bps', txPackets: row.txPackets || '0', rxPackets: row.rxPackets || '0',
            };
        };
        const interfaceEntries = (ethernetOnly = false) => Object.keys(interfaceTables).filter((table) => !ethernetOnly || table === 'interfaces').flatMap((table) => (state.tables[table] || []).map((row, index) => ({ table, index, row: interfaceDetails(table, index) })));
        const draft = (table, index = null) => {
            const current = table === 'identity' ? { identity: state.identity } : table === 'dns' ? state.dns : index === null ? {} : state.tables[table][index];
            const defaults = Object.fromEntries(schemas[table].fields.map((item) => [item.key, clone(item.default ?? (item.type === 'checkbox' ? false : ['list', 'checks'].includes(item.type) ? [] : ''))]));
            return { ...defaults, ...clone(current), ...(index !== null && interfaceTables[table] ? interfaceDetails(table, index) : {}) };
        };
        const save = (table, values, index = null) => {
            if (!schemas[table]) throw new Error('Menu tidak dikenal.');
            const data = { ...draft(table, index), ...clone(values) };
            for (const key of ['leaseTime', 'idleTimeout', 'sessionTimeout', 'keepaliveTimeout', 'helloTime', 'forwardDelay', 'ageingTime', 'limitUptime']) if (data[key]) data[key] = duration(data[key]);
            for (const item of schemas[table].fields) {
                if (item.type === 'number') {
                    data[item.key] = Number(data[item.key]);
                    if (!Number.isFinite(data[item.key]) || item.min !== undefined && data[item.key] < item.min || item.max !== undefined && data[item.key] > item.max) throw new Error(item.label + ': nilai di luar rentang.');
                }
                if (item.type === 'ip' && data[item.key] && !isIp(data[item.key])) throw new Error(item.label + ': alamat IP tidak valid.');
                if (item.type === 'cidr' && data[item.key]) {
                    const [ip, prefix] = data[item.key].split('/');
                    if (!isIp(ip) || prefix === undefined || Number(prefix) < 0 || Number(prefix) > 32) throw new Error(item.label + ': gunakan alamat/prefix yang valid.');
                }
            }
            if (table === 'identity') { if (!data.identity.trim()) throw new Error('Identity tidak boleh kosong.'); state.identity = data.identity.trim(); return null; }
            if (table === 'dns') { if (data.servers.some((ip) => !isIp(ip))) throw new Error('Servers: alamat DNS tidak valid.'); state.dns = data; return null; }
            if (data.name && (interfaceTables[table] ? Object.keys(interfaceTables).some((key) => state.tables[key].some((row, rowIndex) => (key !== table || rowIndex !== index) && row.name === data.name)) : state.tables[table].some((row, rowIndex) => rowIndex !== index && row.name === data.name))) throw new Error('Name: nama sudah digunakan.');
            data.disabled = Boolean(data.disabled);
            if (table === 'addresses' && !data.network) data.network = subnet(data.address) + '.0';
            if (table === 'wan') { data.status = data.disabled ? 'stopped' : 'bound'; data.address = data.disabled ? '' : '203.0.113.2/24'; }
            const previousName = index === null ? null : state.tables[table][index]?.name;
            if (index === null) { state.tables[table].push(data); index = state.tables[table].length - 1; } else state.tables[table][index] = data;
            if (previousName && data.name && previousName !== data.name) {
                const references = interfaceTables[table] ? ['interface', 'inInterface', 'outInterface', 'bridge', 'ports', 'tagged', 'untagged', 'slaves', 'primary'] : table === 'security' ? ['securityProfile'] : table === 'profiles' || table === 'hotspotProfiles' ? ['profile'] : table === 'pools' ? ['pool', 'addressPool'] : [];
                for (const rows of Object.values(state.tables)) for (const row of rows) for (const key of references) {
                    if (row[key] === previousName) row[key] = data.name;
                    else if (Array.isArray(row[key])) row[key] = row[key].map((value) => value === previousName ? data.name : value);
                }
            }
            return index;
        };
        const setupDhcp = (values) => {
            const poolName = 'dhcp_pool' + state.tables.pools.length;
            save('pools', { name: poolName, ranges: values.pool });
            save('networks', { address: values.network, gateway: values.gateway, dns: values.dns });
            save('dhcp', { name: 'dhcp' + (state.tables.dhcp.length + 1), interface: values.interface, pool: poolName, leaseTime: values.leaseTime });
        };
        const setupHotspot = (values) => {
            const name = 'hotspot' + (state.tables.hotspot.length + 1);
            const pool = name + '-pool';
            save('pools', { name: pool, ranges: values.pool });
            save('hotspotProfiles', { name: name + '-profile', hotspotAddress: String(values.localAddress).split('/')[0], dnsName: values.dnsName, htmlDirectory: 'hotspot' });
            save('hotspot', { name, ...values, addressPool: pool, profile: name + '-profile' });
            save('users', { name: values.username, password: values.password, profile: 'default', server: name });
            if (!active('addresses').some((row) => row.interface === values.interface && row.address === values.localAddress)) save('addresses', { interface: values.interface, address: values.localAddress });
            save('networks', { address: subnet(values.localAddress) + '.0/24', gateway: String(values.localAddress).split('/')[0], dns: values.dns });
            save('dhcp', { name: name + '-dhcp', interface: values.interface, pool, leaseTime: '01:00:00' });
            if (values.masquerade) save('nat', { chain: 'srcnat', srcAddress: subnet(values.localAddress) + '.0/24', action: 'masquerade' });
        };
        const network = () => {
            const port = active('interfaces').find((row) => row.defaultName === state.physical.pcPort || row.name === state.physical.pcPort);
            const linked = state.physical.pcLan && state.physical.pcPort && port;
            let sourceInterface = port?.name;
            if (state.device === 'hEX lite' && linked) {
                const accessPort = active('switchPorts').find((row) => row.name === state.physical.pcPort && row.mode === 'secure');
                const vlan = active('switchVlans').find((row) => Number(row.vlanId) === Number(accessPort?.vlanId) && row.ports?.includes(state.physical.pcPort) && row.ports.includes('ether1'));
                if (!accessPort || !vlan || !active('bridgePorts').some((row) => row.interface === state.physical.pcPort)) sourceInterface = null;
            }
            const server = active('dhcp').find((row) => row.interface === sourceInterface);
            const pool = active('pools').find((row) => row.name === server?.pool);
            const config = active('networks').find((row) => subnet(row.address) === subnet(String(pool?.ranges).split('-')[0]));
            const gatewayReady = config && active('addresses').some((row) => row.interface === sourceInterface && row.address.split('/')[0] === config.gateway);
            return { linked: Boolean(linked), address: linked && pool && gatewayReady ? pool.ranges.split('-')[0] : '0.0.0.0', gateway: linked && gatewayReady ? config.gateway : '0.0.0.0', mask: linked && gatewayReady ? '255.255.255.0' : '0.0.0.0' };
        };
        const routerReachable = (target) => {
            const wan = active('wan')[0];
            const route = active('routes').some((row) => row.dstAddress === '0.0.0.0/0') || wan?.addDefaultRoute;
            return Boolean(wan && route && (isIp(target) || state.dns.servers.length));
        };
        const command = (commandText, source = 'pc') => {
            const commandTextTrimmed = commandText.trim();
            const config = network();
            if (/^ipconfig(?:\s+\/(all|renew))?$/i.test(commandTextTrimmed) && source === 'pc') {
                if (config.address !== '0.0.0.0') state.tests.pcIp = config.address;
                return !config.linked ? 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Media State . . . . . : Media disconnected\n' : 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . : ' + config.address + '\n   Subnet Mask . . . . . : ' + config.mask + '\n   Default Gateway . . . : ' + config.gateway + '\n';
            }
            const ping = commandTextTrimmed.match(/^ping\s+(\S+)$/i);
            if (ping) {
                const success = source === 'router' ? routerReachable(ping[1]) : config.address !== '0.0.0.0' && (ping[1] === config.gateway || routerReachable(ping[1]) && active('nat').some((row) => row.action === 'masquerade' && row.outInterface === active('wan')[0]?.interface));
                if (success) state.tests[source === 'router' ? 'routerPing' : 'pcPing'] = ping[1];
                return 'Pinging ' + ping[1] + ' with 32 bytes of data:\n' + Array.from({ length: 4 }, () => success ? 'Reply from ' + ping[1] + ': bytes=32 time=1ms TTL=64' : 'Request timed out.').join('\n') + '\n';
            }
            if (source === 'router' && /^\/system identity set name=/.test(commandTextTrimmed)) { state.identity = commandTextTrimmed.split('name=')[1].replace(/^"|"$/g, ''); return ''; }
            if (source === 'router' && /^\/ip address print$/.test(commandTextTrimmed)) return active('addresses').map((row) => row.address + '  ' + row.interface).join('\n');
            return source === 'router' ? 'bad command name\n' : "'" + commandTextTrimmed + "' is not recognized as an internal or external command.\n";
        };
        const connectPhone = (ssid, password) => {
            const wifi = active('wireless').find((row) => row.ssid === ssid && ['ap bridge', 'bridge'].includes(row.mode));
            if (!wifi) throw new Error('Jaringan tidak tersedia.');
            const security = active('security').find((row) => row.name === wifi.securityProfile);
            if (security?.mode === 'dynamic keys' && security.key !== password) throw new Error('Password Wi-Fi salah.');
            state.phone.ssid = ssid; state.phone.authenticatedUser = '';
        };
        const loginPhone = (name, password) => {
            if (!state.phone.ssid || !active('hotspot').length) throw new Error('Hubungkan Wi-Fi dan pastikan layanan HotSpot aktif.');
            const user = active('users').find((row) => row.name === name && row.password === password);
            if (!user) throw new Error('invalid username or password');
            state.phone.authenticatedUser = name;
        };
        return { state, options, draft, save, interfaceDetails, interfaceEntries, setupDhcp, setupHotspot, network, command, connectPhone, loginPhone,
            remove(table, index) { if (['interfaces', 'wireless', 'lte'].includes(table)) throw new Error('Interface perangkat tidak dapat dihapus.'); state.tables[table].splice(index, 1); },
            toggle(table, index, disabled) { state.tables[table][index].disabled = disabled; if (table === 'wan') state.tables[table][index].status = disabled ? 'stopped' : 'bound'; },
            snapshot: () => clone(state),
        };
    };
    window.NetGuardPracticeSimulator = { create, schemas, isIp };
})();

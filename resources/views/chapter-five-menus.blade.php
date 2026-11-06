@php
    $winboxMenus = [
        'ip' => ['ARP', 'Addresses', 'Cloud', 'DHCP Client', 'DHCP Relay', 'DHCP Server', 'DNS', 'Firewall', 'Hotspot', 'IPsec', 'Kid Control', 'Neighbors', 'Packing', 'Pool', 'Routes', 'Services', 'Settings', 'SMB', 'SNMP', 'Socks', 'TFTP', 'Traffic Flow', 'UPnP', 'Web Proxy'],
        'ipv6' => ['Addresses', 'DHCP Client', 'DHCP Relay', 'DHCP Server', 'Firewall', 'ND', 'Neighbors', 'Pool', 'Routes', 'Settings'],
        'mpls' => ['Interfaces', 'LDP', 'Forwarding Table', 'Local Bindings', 'Remote Bindings', 'Traffic Eng'],
        'routing' => ['BFD', 'BGP', 'Filters', 'IGMP Proxy', 'OSPF', 'PIM', 'RIP', 'Routes', 'Rules', 'Settings', 'Tables'],
        'tools' => ['Bandwidth Test', 'Email', 'Flood Ping', 'Graphing', 'IP Scan', 'MAC Server', 'Netwatch', 'Packet Sniffer', 'Ping', 'Ping Speed', 'Profile', 'RoMON', 'SMS', 'Speed Test', 'Telnet', 'Torch', 'Traceroute', 'Traffic Generator', 'Traffic Monitor', 'WoL'],
    ];
@endphp
@foreach ($winboxMenus as $menuName => $menuItems)
    <div class="routeros__submenu ch5-system-menu" data-ch5-submenu="{{ $menuName }}" hidden aria-label="{{ strtoupper($menuName) }}">
        @foreach ($menuItems as $menuItem)
            <span aria-disabled="true" title="Pengaturan ini belum tersedia dalam simulasi chapter ini."><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#{{ $menuName === 'tools' ? 'tools' : 'ip' }}"></use></svg>{{ $menuItem }}</span>
        @endforeach
    </div>
@endforeach

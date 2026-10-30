<div class="routeros__submenu winbox-ip-menu" @if ($ipChapter === 1) data-ip-menu @else data-ch2-submenu="ip" @endif hidden aria-label="IP">
    @foreach (['ARP', 'Addresses', 'Cloud', 'DHCP Client', 'DHCP Relay', 'DHCP Server', 'DNS', 'Firewall', 'Hotspot', 'IPsec', 'Kid Control', 'Neighbors', 'Packing', 'Pool', 'Routes', 'Services', 'Settings', 'SMB', 'SNMP', 'Socks', 'TFTP', 'Traffic Flow', 'UPnP', 'Web Proxy'] as $ipItem)
        @if (isset($ipWindows[$ipItem]))
            <button type="button" data-ip-item="{{ $ipItem }}" data-open-window="{{ $ipWindows[$ipItem] }}"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#{{ $ipItem === 'Routes' ? 'routing' : 'ip' }}"></use></svg>{{ $ipItem }}</button>
        @else
            <span data-ip-item="{{ $ipItem }}"><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#{{ $ipItem === 'Routes' ? 'routing' : 'ip' }}"></use></svg>{{ $ipItem }}</span>
        @endif
    @endforeach
</div>

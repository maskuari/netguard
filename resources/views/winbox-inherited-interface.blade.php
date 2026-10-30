<section class="winbox-child ch2-window ch2-window--list ch4-native-window" data-window="interfaces" aria-label="Interface List" hidden>
    <header><span>Interface List</span><span class="ch2-window-controls"><button type="button" data-minimize="interfaces" aria-label="Minimalkan">−</button><button type="button" data-maximize="interfaces" aria-label="Maksimalkan">□</button><button type="button" data-close="interfaces" aria-label="Tutup">×</button></span></header>
    <div class="ch2-window-tabs">@foreach (['interfaces' => 'Interface', 'lists' => 'Interface List', 'ethernet' => 'Ethernet', 'eoip' => 'EoIP Tunnel', 'ipip' => 'IP Tunnel', 'gre' => 'GRE Tunnel', 'vlans' => 'VLAN', 'vxlan' => 'VXLAN', 'vrrp' => 'VRRP', 'bonding' => 'Bonding', 'lte' => 'LTE'] as $key => $tab)<button type="button" data-inherited-tab="{{ $key }}" @class(['is-active' => $key === 'interfaces'])>{{ $tab }}</button>@endforeach</div>
    <div class="ch2-window-toolbar ch4-native-toolbar">
        @foreach (['add' => 'Add', 'remove' => 'Remove', 'enable' => 'Enable', 'disable' => 'Disable', 'comment' => 'Comment', 'filter' => 'Filter'] as $tool => $label)<button type="button" data-inherited-interface-tool="{{ $tool }}" title="{{ $label }}" aria-label="{{ $label }}"><svg class="wb-icon" aria-hidden="true"><use href="{{ asset('images/logo/winbox-icons.svg') }}#{{ $tool }}"></use></svg></button>@endforeach
        <button type="button" data-inherited-interface-tool="detect">Detect Internet</button><input type="search" data-interface-find placeholder="Find" aria-label="Cari interface"><span>all</span>
    </div>
    <div class="ch2-table inherited-table ch4-native-interface-table" data-inherited-interfaces data-native-interfaces></div>
    <div class="ch2-table inherited-table ch4-native-interface-table" data-inherited-ethernet data-native-interfaces hidden></div>
    <div class="ch2-table inherited-table ch4-native-vlan-table" data-inherited-vlans data-native-vlans hidden></div>
    @foreach (['lists', 'eoip', 'ipip', 'gre', 'vxlan', 'vrrp', 'bonding', 'lte'] as $tab)<div class="ch2-table inherited-table" data-inherited-{{ $tab }} hidden><div class="ch2-table__head"><span>Name</span><span>Type</span><span>Actual MTU</span><span>Tx</span><span>Rx</span></div></div>@endforeach
    <footer>0 items</footer>
</section>

@foreach (['dhcp' => 'DHCP Server', 'pools' => 'IP Pool'] as $window => $title)
    <section class="winbox-child ch2-window ch2-window--list" data-window="{{ $window }}" aria-label="{{ $title }}" hidden>
        <header><span>{{ $title }}</span><span class="ch2-window-controls"><button type="button" data-minimize="{{ $window }}" aria-label="Minimalkan">−</button><button type="button" data-maximize="{{ $window }}" aria-label="Maksimalkan">□</button><button type="button" data-close="{{ $window }}" aria-label="Tutup">×</button></span></header>
        @if ($window === 'dhcp')
            <div class="ch2-window-tabs"><button type="button" data-inherited-tab="dhcp">DHCP</button><button type="button" data-inherited-tab="networks">Networks</button></div>
            <div class="ch2-table inherited-table inherited-table--dhcp" data-inherited-dhcp></div>
            <div class="ch2-table inherited-table inherited-table--networks" data-inherited-networks hidden></div>
        @else
            <div class="ch2-window-tabs"><b>Pools</b></div>
            <div class="ch2-table inherited-table inherited-table--pools" data-inherited-pools></div>
        @endif
    </section>
@endforeach

<div class="interface-list @if ($interfaceChapter === 2) ch2-table ch2-interface-table @endif" data-physical-interface-list>
    <div class="interface-list__head @if ($interfaceChapter === 2) ch2-table__head @endif">@foreach (['#', '', 'Name', 'Type', 'MTU', 'Actual MTU', 'L2 MTU', 'Tx', 'Rx', 'FP Tx', 'FP Rx'] as $column)<span>{{ $column }}</span>@endforeach</div>
    @foreach (['ether1', 'ether2', 'ether3', 'ether4', 'wlan1'] as $index => $interfaceName)
        @php
            $isEditable = $index < 3;
            $displayName = $interfaceChapter === 2 && $isEditable ? ['ether1-internet', 'ether2-vlan', 'ether3-local'][$index] : $interfaceName;
            $isWireless = $interfaceName === 'wlan1';
        @endphp
        @if ($isEditable)
            <button type="button" data-edit-interface="{{ $interfaceName }}" class="interface-list__row">
        @else
            <div class="interface-list__static">
        @endif
            <span>{{ $index }}</span><span>{{ $isEditable ? 'R' : '' }}</span>
            <strong><svg class="wb-icon" aria-hidden="true" focusable="false"><use href="{{ asset('images/logo/winbox-icons.svg') }}#{{ $isWireless ? 'wireless' : 'interfaces' }}"></use></svg>@if ($isEditable)<span data-interface-name="{{ $interfaceName }}">{{ $displayName }}</span>@else<span>{{ $displayName }}</span>@endif</strong>
            <span>{{ $isWireless ? 'Wireless' : 'Ethernet' }}</span><span>1500</span><span>1500</span><span>{{ $isWireless ? '1600' : '1598' }}</span>
            <span>0 bps</span><span>0 bps</span><span>0 bps</span><span>0 bps</span>
        @if ($isEditable)
            </button>
        @else
            </div>
        @endif
    @endforeach
</div>

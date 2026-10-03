<template id="{{ $id }}">
    <ol class="resource-list">
        <li><span>01</span><div><h3>Perangkat &amp; Router</h3><p>Kenali perangkat, kabel, dan konfigurasi awal router.</p></div></li>
        <li><span>02</span><div><h3>IP, VLAN &amp; DHCP</h3><p>Atur alamat dan sambungkan jaringan klien.</p></div></li>
        <li><span>03</span><div><h3>Akses Internet</h3><p>Hubungkan jaringan lokal ke internet.</p></div></li>
        <li><span>04</span><div><h3>WiFi &amp; HotSpot</h3><p>Sediakan akses nirkabel yang terkelola.</p></div></li>
        <li><span>05</span><div><h3>VLAN Switch</h3><p>Satukan jaringan sekolah dengan switch.</p></div></li>
    </ol>
    @if (! $isAdventure)
        <a class="button button--outline game-materials__link" href="{{ $isWelcome ? route('login') : route('adventure') }}" data-page-link="{{ $isWelcome ? 'login' : 'adventure' }}">{{ $isWelcome ? 'Login untuk belajar' : 'Lihat chapter' }}</a>
    @endif
</template>

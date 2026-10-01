@php
    $chapters = [
        [
            'number' => '01',
            'short' => 'Perangkat & Router',
            'title' => 'Perangkat dan Konfigurasi Awal Router',
            'summary' => 'Mulai dari alat, kabel, dan koneksi pertama.',
            'story' => 'Sekolah membutuhkan fondasi jaringan yang rapi. Kenali perangkat, siapkan kabel, lalu pastikan router dapat diakses sebelum melanjutkan konfigurasi.',
            'topics' => ['Perangkat hAP, hEX, dan alat jaringan', 'Kabel straight T568B & LAN tester', 'Topologi, WinBox, identity & interface'],
            'result' => 'Router siap dikonfigurasi.',
            'icon' => 'chapter-router',
        ],
        [
            'number' => '02',
            'short' => 'IP, VLAN & DHCP',
            'title' => 'Pengalamatan IP, VLAN dan DHCP',
            'summary' => 'Bagi jaringan dan sambungkan setiap klien.',
            'story' => 'Setelah perangkat siap, bentuk segmen siswa dan guru. Pasangkan alamat IP pada interface yang benar dan siapkan pembagian alamat otomatis.',
            'topics' => ['VLAN pada router', 'IP address & gateway', 'DHCP Client WAN & DHCP Server'],
            'result' => 'Klien memperoleh konfigurasi jaringan.',
            'icon' => 'chapter-network',
        ],
        [
            'number' => '03',
            'short' => 'Akses Internet',
            'title' => 'Akses Internet melalui Router',
            'summary' => 'Buka jalur dari jaringan lokal ke internet.',
            'story' => 'Klien sudah mendapat alamat. Kini periksa jalur keluar, siapkan DNS dan NAT, lalu uji koneksi dari router sampai ke perangkat pengguna.',
            'topics' => ['DNS resolver & default route', 'NAT srcnat masquerade', 'Pengujian & troubleshooting koneksi'],
            'result' => 'Klien dapat mengakses internet.',
            'icon' => 'chapter-globe',
        ],
        [
            'number' => '04',
            'short' => 'WiFi & HotSpot',
            'title' => 'WiFi, HotSpot dan Pengelolaan Pengguna',
            'summary' => 'Sediakan akses nirkabel yang terkelola.',
            'story' => 'Sekolah memerlukan WiFi dan akses untuk kelompok pengguna berbeda. Atur SSID, keamanan, HotSpot, serta profil dan akun pengguna.',
            'topics' => ['Wireless, SSID & Security Profile', 'HotSpot & halaman login', 'User Profile, shared users & rate limit'],
            'result' => 'Pengguna dapat terhubung dan diautentikasi.',
            'icon' => 'chapter-wifi',
        ],
        [
            'number' => '05',
            'short' => 'VLAN Switch',
            'title' => 'VLAN Switch dan Integrasi Jaringan',
            'summary' => 'Satukan semua bagian jaringan sekolah.',
            'story' => 'Hubungkan hasil konfigurasi router dengan switch. Tentukan port trunk dan access, lalu buktikan segmentasi dengan menguji klien di beberapa port.',
            'topics' => ['Bridge & keanggotaan VLAN', 'Port trunk dan access', 'Integrasi & pengujian segmentasi'],
            'result' => 'Jaringan sekolah tersegmentasi dan teruji.',
            'icon' => 'chapter-switch',
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="id" data-page="adventure">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0066ff">
        <meta name="description" content="Pilih satu dari lima chapter Adventure Mode NetGuard Academy.">
        <title>Adventure Mode — NetGuard Academy</title>
        <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
        <link rel="preload" as="image" href="{{ asset('images/background/bghome2.png') }}">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/adventure.css') }}?v={{ filemtime(public_path('css/adventure.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
        <script src="{{ asset('js/adventure.js') }}?v={{ filemtime(public_path('js/adventure.js')) }}" defer></script>
    </head>
    <body>
        <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <symbol id="chapter-home" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 2 1.5 11h2.8v9.3c0 .9.7 1.7 1.7 1.7h4.2v-7h3.6v7H18c1 0 1.7-.8 1.7-1.7V11h2.8L12 2Z"/></symbol>
                <symbol id="chapter-arrow" viewBox="0 0 24 24"><path d="m14 5-7 7 7 7M8 12h13"/></symbol>
                <symbol id="chapter-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
                <symbol id="chapter-router" viewBox="0 0 48 48"><rect x="6" y="21" width="36" height="18" rx="5"/><path d="M15 21V7M33 21V7M11 30h.01M18 30h.01M25 30h.01M31 30h7"/></symbol>
                <symbol id="chapter-network" viewBox="0 0 48 48"><rect x="19" y="5" width="10" height="9" rx="2"/><rect x="4" y="33" width="11" height="9" rx="2"/><rect x="19" y="33" width="10" height="9" rx="2"/><rect x="33" y="33" width="11" height="9" rx="2"/><path d="M24 14v10M9.5 33v-9h29v9M24 24v9"/></symbol>
                <symbol id="chapter-globe" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"/><path d="M5 24h38M24 5c-7 6-10 12-10 19s3 13 10 19M24 5c7 6 10 12 10 19s-3 13-10 19M8 14h32M8 34h32"/></symbol>
                <symbol id="chapter-wifi" viewBox="0 0 48 48"><path d="M4 17c12-11 28-11 40 0M10 24c8-8 20-8 28 0M17 31c4-4 10-4 14 0"/><circle cx="24" cy="39" r="2" fill="currentColor" stroke="none"/></symbol>
                <symbol id="chapter-switch" viewBox="0 0 48 48"><rect x="4" y="12" width="40" height="25" rx="5"/><path d="M10 21h6v6h-6zM21 21h6v6h-6zM32 21h6v6h-6zM10 33h8M30 33h8"/></symbol>
            </defs>
        </svg>

        <div class="academy-scene adventure-scene">
            <div class="classroom adventure-background" aria-hidden="true">
                <img class="classroom__image" src="{{ asset('images/background/bghome2.png') }}" alt="" decoding="async">
            </div>
            <header class="navbar adventure-navbar">
                <a class="brand" href="{{ route('homepage') }}" data-page-link="homepage" aria-label="NetGuard Academy, kembali ke Beranda">
                    <span class="brand__mascot"><img src="{{ asset('images/logo/logo.png') }}" alt="" decoding="async"></span>
                    <span class="brand__copy"><span class="brand__name">NetGuard <span>Academy</span></span><span class="brand__tagline">MikroTik Mission</span></span>
                </a>
                <nav class="nav-links" aria-label="Navigasi utama">
                    <a class="nav-link" href="{{ route('homepage') }}" data-page-link="homepage"><svg class="icon" aria-hidden="true"><use href="#chapter-home"/></svg><span>Beranda</span></a>
                    <span class="nav-link is-active" aria-current="page">Adventure Mode</span>
                </nav>
                <span class="adventure-user" title="{{ auth()->user()->name }}">{{ auth()->user()->name }}</span>
            </header>

            <main class="adventure-main" id="main-content">
                <header class="adventure-intro">
                    <div class="adventure-intro__copy">
                        <p class="adventure-kicker"><span class="adventure-kicker__dot"></span> PETUALANGAN JARINGAN DIMULAI</p>
                        <h1>Pilih chapter <span>petualanganmu</span></h1>
                        <p>Bangun jaringan sekolah selangkah demi selangkah. Pilih chapter untuk melihat tantangan dan materi yang akan kamu pelajari.</p>
                    </div>
                    <img class="adventure-intro__art" src="{{ asset('images/asset/advanture.png') }}" alt="" width="3264" height="3264" decoding="async" aria-hidden="true">
                </header>

                <section class="chapter-section" aria-labelledby="chapter-section-title">
                    <div class="chapter-section__heading">
                        <div><p class="chapter-section__eyebrow">JALUR BELAJAR</p><h2 id="chapter-section-title">Lima chapter, satu misi besar</h2></div>
                        <span class="chapter-section__count">01 — 05</span>
                    </div>
                    <div class="chapter-track" role="tablist" aria-label="Pilih chapter Adventure Mode">
                        @foreach ($chapters as $chapter)
                            <button class="chapter-card{{ $loop->first ? ' is-selected' : '' }}" type="button" role="tab" id="chapter-tab-{{ $chapter['number'] }}" aria-controls="chapter-panel-{{ $chapter['number'] }}" aria-selected="{{ $loop->first ? 'true' : 'false' }}" tabindex="{{ $loop->first ? '0' : '-1' }}" data-chapter="{{ $chapter['number'] }}">
                                <span class="chapter-card__top"><span class="chapter-card__number">CHAPTER {{ $chapter['number'] }}</span><svg class="icon chapter-card__chevron" aria-hidden="true"><use href="#chapter-chevron"/></svg></span>
                                <span class="chapter-card__icon"><svg class="icon" aria-hidden="true"><use href="#{{ $chapter['icon'] }}"/></svg></span>
                                <span class="chapter-card__title">{{ $chapter['short'] }}</span>
                                <span class="chapter-card__summary">{{ $chapter['summary'] }}</span>
                            </button>
                        @endforeach
                    </div>
                </section>

                <div class="chapter-panels">
                    @foreach ($chapters as $chapter)
                        <section class="chapter-panel" role="tabpanel" id="chapter-panel-{{ $chapter['number'] }}" aria-labelledby="chapter-tab-{{ $chapter['number'] }}" tabindex="0" @if (! $loop->first) hidden @endif>
                            <div class="chapter-panel__story">
                                <span class="chapter-panel__label">CHAPTER {{ $chapter['number'] }} / 05</span>
                                <h2>{{ $chapter['title'] }}</h2>
                                <p>{{ $chapter['story'] }}</p>
                            </div>
                            <div class="chapter-panel__topics">
                                <h3>Yang akan dipelajari</h3>
                                <ul>@foreach ($chapter['topics'] as $topic)<li>{{ $topic }}</li>@endforeach</ul>
                            </div>
                            <div class="chapter-panel__outcome">
                                <span class="chapter-panel__outcome-label">TARGET AKHIR</span>
                                <strong>{{ $chapter['result'] }}</strong>
                                <span class="chapter-panel__soon">Misi interaktif sedang disiapkan</span>
                            </div>
                        </section>
                    @endforeach
                </div>
                <footer class="adventure-footer">
                    <a href="{{ route('homepage') }}" data-page-link="homepage"><svg class="icon" aria-hidden="true"><use href="#chapter-arrow"/></svg> Kembali ke Beranda</a>
                    <span>NetGuard Academy · MikroTik Mission</span>
                </footer>
            </main>
        </div>
    </body>
</html>

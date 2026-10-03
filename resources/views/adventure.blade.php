@php
    $user = auth()->user();
    $chapters = [
        [
            'number' => '01',
            'image' => 'cp1.png',
            'detail_image' => 'CHP1.png',
            'short' => 'Perangkat & Router',
            'title' => 'Perangkat dan Konfigurasi Awal Router',
            'summary' => 'Mulai dari alat, kabel, dan koneksi pertama.',
            'story' => 'Sekolah membutuhkan fondasi jaringan yang rapi. Kenali perangkat, siapkan kabel, lalu pastikan router dapat diakses sebelum melanjutkan konfigurasi.',
            'topics' => ['Pengenalan perangkat MikroTik (hAP, hEX, dll)', 'Fungsi dan jenis kabel jaringan', 'Konfigurasi awal melalui WinBox', 'Pengenalan interface dan identitas router'],
            'tags' => ['Router', 'Kabel & Konektor', 'Konfigurasi Dasar', 'WinBox'],
            'result' => 'Router siap dikonfigurasi.',
            'outcome' => 'Berhasil mengakses router dan memahami fungsi dasar setiap perangkat.',
            'icon' => 'chapter-router',
        ],
        [
            'number' => '02',
            'image' => 'cp2.png',
            'detail_image' => 'CHP2.png',
            'short' => 'IP, VLAN & DHCP',
            'title' => 'Pengalamatan IP, VLAN dan DHCP',
            'summary' => 'Bagi jaringan dan sambungkan setiap klien.',
            'story' => 'Setelah perangkat siap, bentuk segmen siswa dan guru. Pasangkan alamat IP pada interface yang benar dan siapkan pembagian alamat otomatis.',
            'topics' => ['VLAN pada router', 'IP address & gateway', 'DHCP Client WAN & DHCP Server'],
            'tags' => ['IP Address', 'VLAN', 'Gateway', 'DHCP'],
            'result' => 'Klien memperoleh konfigurasi jaringan.',
            'outcome' => 'Jaringan siswa dan guru terpisah, lalu setiap klien mendapat alamat IP.',
            'icon' => 'chapter-network',
        ],
        [
            'number' => '03',
            'image' => 'cp3.png',
            'detail_image' => 'CHP3.png',
            'short' => 'Akses Internet',
            'title' => 'Akses Internet melalui Router',
            'summary' => 'Buka jalur dari jaringan lokal ke internet.',
            'story' => 'Klien sudah mendapat alamat. Kini periksa jalur keluar, siapkan DNS dan NAT, lalu uji koneksi dari router sampai ke perangkat pengguna.',
            'topics' => ['DNS resolver & default route', 'NAT srcnat masquerade', 'Pengujian & troubleshooting koneksi'],
            'tags' => ['DNS', 'Default Route', 'NAT', 'Troubleshooting'],
            'result' => 'Klien dapat mengakses internet.',
            'outcome' => 'Koneksi dari klien menuju internet berhasil diuji melalui router.',
            'icon' => 'chapter-globe',
        ],
        [
            'number' => '04',
            'image' => 'cp4.png',
            'detail_image' => 'CHP4.png',
            'short' => 'WiFi & HotSpot',
            'title' => 'WiFi, HotSpot dan Pengelolaan Pengguna',
            'summary' => 'Sediakan akses nirkabel yang terkelola.',
            'story' => 'Sekolah memerlukan WiFi dan akses untuk kelompok pengguna berbeda. Atur SSID, keamanan, HotSpot, serta profil dan akun pengguna.',
            'topics' => ['Wireless, SSID & Security Profile', 'HotSpot & halaman login', 'User Profile, shared users & rate limit'],
            'tags' => ['Wireless', 'SSID', 'HotSpot', 'User Profile'],
            'result' => 'Pengguna dapat terhubung dan diautentikasi.',
            'outcome' => 'Akses WiFi sekolah terkelola untuk setiap kelompok pengguna.',
            'icon' => 'chapter-wifi',
        ],
        [
            'number' => '05',
            'image' => 'cp5.png',
            'detail_image' => 'CHP5.png',
            'short' => 'VLAN Switch',
            'title' => 'VLAN Switch dan Integrasi Jaringan',
            'summary' => 'Satukan semua bagian jaringan sekolah.',
            'story' => 'Hubungkan hasil konfigurasi router dengan switch. Tentukan port trunk dan access, lalu buktikan segmentasi dengan menguji klien di beberapa port.',
            'topics' => ['Bridge & keanggotaan VLAN', 'Port trunk dan access', 'Integrasi & pengujian segmentasi'],
            'tags' => ['Bridge', 'VLAN Switch', 'Trunk', 'Access Port'],
            'result' => 'Jaringan sekolah tersegmentasi dan teruji.',
            'outcome' => 'Router dan switch bekerja bersama dengan segmentasi yang benar.',
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
        <link rel="preload" as="image" href="{{ asset('images/background/bgchapter.png') }}" fetchpriority="high">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/game-navbar.css') }}?v={{ filemtime(public_path('css/game-navbar.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/adventure.css') }}?v={{ filemtime(public_path('css/adventure.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/game-music.css') }}?v={{ filemtime(public_path('css/game-music.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
        <script src="{{ asset('js/adventure.js') }}?v={{ filemtime(public_path('js/adventure.js')) }}" defer></script>
    </head>
    <body>
        <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <symbol id="chapter-home" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 2 1.5 11h2.8v9.3c0 .9.7 1.7 1.7 1.7h4.2v-7h3.6v7H18c1 0 1.7-.8 1.7-1.7V11h2.8L12 2Z"/></symbol>
                <symbol id="chapter-gamepad" viewBox="0 0 32 24"><path d="M9 2h14c3 0 4.5 2 5.3 5L32 19c.9 4-3.5 6-6 3l-4-5H10l-4 5c-2.5 3-6.9 1-6-3L3.7 7C4.5 4 6 2 9 2Z" fill="currentColor" stroke="none"/><path d="M9 6v8M5 10h8" stroke="#fff" stroke-width="2.4"/><g fill="#fff" stroke="none"><circle cx="23" cy="6.5" r="1.5"/><circle cx="26.5" cy="10" r="1.5"/><circle cx="19.5" cy="10" r="1.5"/><circle cx="23" cy="13.5" r="1.5"/></g></symbol>
                <symbol id="chapter-book" viewBox="0 0 24 24"><path d="M12 5c-3-3-7-3-10-1v17c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v16"/></symbol>
                <symbol id="chapter-help" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M8.8 8a3.3 3.3 0 0 1 6.4 1c0 2.4-3.2 2.3-3.2 4.5M12 17h.01"/></symbol>
                <symbol id="chapter-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/></symbol>
                <symbol id="chapter-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" stroke-width="3"/></symbol>
                <symbol id="chapter-play" viewBox="0 0 24 24"><path d="m6 3 15 9L6 21V3Z" fill="currentColor" stroke="none"/></symbol>
                <symbol id="chapter-flag" viewBox="0 0 24 24"><path d="M5 22V3m0 1c5-3 9 3 15 0v11c-6 3-10-3-15 0"/></symbol>
                <symbol id="chapter-logout" viewBox="0 0 24 24"><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 7l5 5-5 5M8 12h11"/></symbol>
                <symbol id="chapter-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
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
                <img class="classroom__image" src="{{ asset('images/background/bgchapter.png') }}" alt="" fetchpriority="high" decoding="async">
            </div>
            @include('game-navbar', ['page' => 'adventure'])

            <main class="adventure-main" id="main-content">
                <header class="adventure-intro">
                    <div class="adventure-intro__copy">
                        <p class="adventure-kicker"><svg class="icon" aria-hidden="true"><use href="#chapter-gamepad"/></svg> ADVENTURE MODE</p>
                        <h1>Pilih chapter <span>petualanganmu</span></h1>
                        <p>Bangun jaringan sekolah selangkah demi selangkah. Pilih chapter untuk melihat tantangan dan materi yang akan kamu pelajari.</p>
                    </div>
                    <p class="adventure-intro__sticker" aria-hidden="true">Jelajahi<br><span>Dunia Jaringan</span><br>MikroTik!</p>
                </header>

                <section class="chapter-section" aria-label="Pilih chapter Adventure Mode">
                    <div class="chapter-track" role="tablist" aria-label="Lima chapter Adventure Mode">
                        <svg class="chapter-route" viewBox="0 0 1600 140" preserveAspectRatio="none" aria-hidden="true"><path d="M60 50 C160 140 270 30 360 90 S590 145 680 75 S900 150 1000 85 S1210 145 1320 80 S1490 105 1550 58"/></svg>
                        @foreach ($chapters as $chapter)
                            <button class="chapter-card{{ $loop->first ? ' is-selected' : '' }}" type="button" role="tab" id="chapter-tab-{{ $chapter['number'] }}" aria-controls="chapter-panel-{{ $chapter['number'] }}" aria-selected="{{ $loop->first ? 'true' : 'false' }}" tabindex="{{ $loop->first ? '0' : '-1' }}" data-chapter="{{ $chapter['number'] }}">
                                <img class="chapter-card__island" src="{{ asset('images/asset/'.$chapter['image']) }}" alt="" width="1448" height="1086" decoding="async" draggable="false">
                                <span class="chapter-card__badge">CHAPTER {{ $chapter['number'] }}</span>
                                <span class="chapter-card__icon"><svg class="icon" aria-hidden="true"><use href="#{{ $chapter['icon'] }}"/></svg></span>
                                <span class="chapter-card__title">{{ $chapter['short'] }}</span>
                                <span class="chapter-card__summary">{{ $chapter['summary'] }}</span>
                                <span class="chapter-card__status">@if ($loop->first)<span class="chapter-card__mission">0 / 5 misi<span class="chapter-card__bar"></span></span>@else<svg class="icon" aria-hidden="true"><use href="#chapter-lock"/></svg> Segera tersedia @endif</span>
                                <span class="chapter-card__marker" aria-hidden="true">{{ $loop->iteration }}</span>
                            </button>
                        @endforeach
                    </div>
                </section>

                <div class="chapter-panels">
                    @foreach ($chapters as $chapter)
                        <section class="chapter-panel" role="tabpanel" id="chapter-panel-{{ $chapter['number'] }}" aria-labelledby="chapter-tab-{{ $chapter['number'] }}" tabindex="0" @if (! $loop->first) hidden @endif>
                            <div class="chapter-panel__picture"><img src="{{ asset('images/asset/'.$chapter['detail_image']) }}" alt="Ilustrasi {{ $chapter['short'] }}" width="1254" height="1254" decoding="async"></div>
                            <div class="chapter-panel__story">
                                <span class="chapter-panel__label">CHAPTER {{ $chapter['number'] }} / 05</span>
                                <h2>{{ $chapter['title'] }}</h2>
                                <p>{{ $chapter['story'] }}</p>
                                <div class="chapter-panel__tags">@foreach ($chapter['tags'] as $tag)<span>{{ $tag }}</span>@endforeach</div>
                            </div>
                            <div class="chapter-panel__learning">
                                <div class="chapter-panel__topics">
                                    <h3><svg class="icon" aria-hidden="true"><use href="#chapter-book"/></svg> Yang akan dipelajari</h3>
                                    <ul>@foreach ($chapter['topics'] as $topic)<li><svg class="icon" aria-hidden="true"><use href="#chapter-check"/></svg><span>{{ $topic }}</span></li>@endforeach</ul>
                                </div>
                                <div class="chapter-panel__outcome">
                                    <h3><svg class="icon" aria-hidden="true"><use href="#chapter-flag"/></svg> Target Akhir</h3>
                                    <div class="chapter-panel__result"><strong>{{ $chapter['result'] }}</strong><span>{{ $chapter['outcome'] }}</span></div>
                                </div>
                            </div>
                            <button class="chapter-panel__start" type="button" data-start-chapter="{{ $chapter['number'] }}"><svg class="icon" aria-hidden="true"><use href="#chapter-play"/></svg><span>Mulai Chapter {{ $chapter['number'] }}</span><svg class="icon" aria-hidden="true"><use href="#chapter-chevron"/></svg></button>
                        </section>
                    @endforeach
                </div>
                <footer class="adventure-footer">
                    <a href="{{ route('homepage') }}" data-page-link="homepage"><svg class="icon" aria-hidden="true"><use href="#chapter-arrow"/></svg> Kembali ke Beranda</a>
                    <span>NetGuard Academy · MikroTik Mission · © {{ date('Y') }}</span>
                </footer>
            </main>
            <div class="adventure-loading" role="status" aria-live="polite" hidden><img src="{{ asset('images/asset/netguard_mikrotik_infinity_loader.svg') }}" alt="" width="320" height="320"><span>Keluar dari akun...</span></div>
        </div>
        <dialog class="information-dialog adventure-dialog" id="adventure-dialog" aria-labelledby="adventure-dialog-title" aria-describedby="adventure-dialog-text">
            <button class="dialog-close" type="button" data-close-dialog aria-label="Tutup"><svg class="icon" aria-hidden="true"><use href="#chapter-close"/></svg></button>
            <div class="dialog-heading"><span class="dialog-emblem"><svg class="icon" aria-hidden="true"><use href="#chapter-book"/></svg></span><p class="eyebrow">NETGUARD ACADEMY</p><h2 id="adventure-dialog-title"></h2><p id="adventure-dialog-text"></p></div>
            <div id="adventure-dialog-content"></div>
            <button class="button button--primary dialog-back" type="button" data-close-dialog>Kembali ke Chapter <svg class="icon" aria-hidden="true"><use href="#chapter-chevron"/></svg></button>
        </dialog>
        @include('game-materials', ['id' => 'adventure-info-materials', 'isWelcome' => false, 'isAdventure' => true])
        <template id="adventure-info-about"><div class="about-note"><span class="note-number">01 — MISIMU DIMULAI DI SINI</span><p>Jelajahi lima chapter, kenali perangkat jaringan, dan siapkan konfigurasi MikroTik selangkah demi selangkah.</p></div></template>
        <template id="adventure-info-resources"><ol class="resource-list"><li><span>01</span><div><h3>Dasar Jaringan</h3><p>Kenali perangkat, kabel, alamat IP dan topologi jaringan.</p></div></li><li><span>02</span><div><h3>Konfigurasi MikroTik</h3><p>Pelajari WinBox, DHCP, koneksi internet, HotSpot, dan VLAN.</p></div></li></ol></template>
        <template id="adventure-info-help"><div class="help-list"><details open><summary>Bagaimana memilih chapter?</summary><p>Pilih salah satu pulau atau kartu chapter. Detailnya muncul di bagian bawah.</p></details><details><summary>Apakah misi bisa dimainkan?</summary><p>Misi interaktif masih disiapkan. Kamu sudah bisa melihat cerita dan materi setiap chapter.</p></details></div></template>
        @include('game-music-player')
    </body>
</html>

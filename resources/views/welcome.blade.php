<!DOCTYPE html>
<html lang="id" data-page="welcome">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0066ff">
        <meta name="description" content="NetGuard Academy — belajar konfigurasi MikroTik melalui simulasi interaktif dan misi menantang.">
        <title>NetGuard Academy — MikroTik Mission</title>
        <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
        <link rel="preload" as="image" href="{{ asset('images/background/home.png') }}" fetchpriority="high">
        <link rel="preload" as="image" href="{{ asset('images/card/cardlogin.png') }}" fetchpriority="high">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/game-navbar.css') }}?v={{ filemtime(public_path('css/game-navbar.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <link rel="prefetch" as="image" href="{{ asset('images/asset/netlogin.png') }}">
        <link rel="prefetch" as="image" href="{{ asset('images/card/cardlog.png') }}">
        <link rel="prefetch" as="style" href="{{ asset('css/auth.css') }}?v={{ filemtime(public_path('css/auth.css')) }}">
        <link rel="prefetch" as="script" href="{{ asset('js/auth.js') }}?v={{ filemtime(public_path('js/auth.js')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
        <script src="{{ asset('js/welcome.js') }}?v={{ filemtime(public_path('js/welcome.js')) }}" defer></script>
    </head>
    <body>
        <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <symbol id="icon-home" viewBox="0 0 24 24">
                    <path fill="currentColor" stroke="none" d="M12 2 1.5 11h2.8v9.3c0 .9.7 1.7 1.7 1.7h4.2v-7h3.6v7H18c1 0 1.7-.8 1.7-1.7V11h2.8L12 2Z"/>
                </symbol>
                <symbol id="icon-about" viewBox="0 0 24 24">
                    <rect x="4" y="2.5" width="15" height="19" rx="2.5"/><path d="M8 7h7M8 11h7M8 15h4M19 6h2v12a2 2 0 0 1-2 2"/>
                </symbol>
                <symbol id="icon-book" viewBox="0 0 24 24">
                    <path d="M12 5c-3-3-7-3-10-1v17c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v16"/>
                </symbol>
                <symbol id="icon-help" viewBox="0 0 24 24">
                    <rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M8.8 8a3.3 3.3 0 0 1 6.4 1c0 2.4-3.2 2.3-3.2 4.5M12 17h.01"/>
                </symbol>
                <symbol id="icon-user" viewBox="0 0 24 24">
                    <circle cx="12" cy="6.6" r="5" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M3 21v-2a9 7 0 0 1 18 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>
                </symbol>
                <symbol id="icon-user-add" viewBox="0 0 28 24">
                    <circle cx="10" cy="6" r="5" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M1 21v-2a9 7 0 0 1 18 0v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"/><path d="M23 7v8M19 11h8" stroke-width="2.7"/>
                </symbol>
                <symbol id="icon-gamepad" viewBox="0 0 32 24">
                    <path fill="currentColor" stroke="none" d="M9 2h14c3 0 4.5 2 5.3 5L32 19c.9 4-3.5 6-6 3l-4-5H10l-4 5c-2.5 3-6.9 1-6-3L3.7 7C4.5 4 6 2 9 2Z"/>
                    <path d="M9 6v8M5 10h8" stroke="var(--button-fill, #0066ff)" stroke-width="2.4"/>
                    <g fill="var(--button-fill, #0066ff)" stroke="none"><circle cx="23" cy="6.5" r="1.5"/><circle cx="26.5" cy="10" r="1.5"/><circle cx="19.5" cy="10" r="1.5"/><circle cx="23" cy="13.5" r="1.5"/></g>
                </symbol>
                <symbol id="icon-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
                <symbol id="icon-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol>
            </defs>
        </svg>

        <div class="academy-scene">
            <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
            <div class="classroom" aria-hidden="true">
                <img class="classroom__image" src="{{ asset('images/background/home.png') }}" alt="" fetchpriority="high" decoding="async">
            </div>
            <div class="sun-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>

            @include('game-navbar', ['page' => 'welcome'])

            <main class="hero" id="main-content" tabindex="-1">
                <h1 class="visually-hidden">NetGuard Academy — MikroTik Mission</h1>
                <p class="visually-hidden">Belajar konfigurasi MikroTik melalui simulasi interaktif dan misi menantang.</p>
                <div class="mission-card">
                    <img class="mission-card__art" src="{{ asset('images/card/cardlogin.png') }}" alt="" fetchpriority="high" decoding="async" draggable="false">
                    <div class="mission-card__actions" aria-label="Mulai petualanganmu">
                        <a class="button button--primary mission-button" href="{{ route('login') }}" data-page-link="login"><svg class="icon icon--gamepad" aria-hidden="true"><use href="#icon-gamepad"/></svg><span>Login</span></a>
                        <a class="button button--outline mission-button" href="{{ route('register') }}" data-page-link="register"><svg class="icon icon--add" aria-hidden="true"><use href="#icon-user-add"/></svg><span>Daftar</span></a>
                    </div>
                </div>
            </main>

        </div>

        <dialog class="information-dialog" id="information-dialog" aria-labelledby="panel-title" aria-describedby="panel-description">
            <button class="dialog-close" type="button" aria-label="Tutup panel"><svg class="icon" aria-hidden="true"><use href="#icon-close"/></svg></button>
            <div class="dialog-heading">
                <span class="dialog-emblem"><svg class="icon" aria-hidden="true"><use id="panel-icon" href="#icon-about"/></svg></span>
                <p class="eyebrow">NETGUARD ACADEMY</p>
                <h2 id="panel-title"></h2><p id="panel-description"></p>
            </div>
            <div id="panel-content"></div>
            <button class="button button--primary dialog-back" type="button">Kembali ke Beranda <svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg></button>
        </dialog>

        @include('game-materials', ['id' => 'panel-materials', 'isWelcome' => true, 'isAdventure' => false])
        <template id="panel-about">
            <div class="about-note"><span class="note-number">01 — MISIMU DIMULAI DI SINI</span><p>Kenali jaringan, pelajari konfigurasi MikroTik, dan asah kemampuanmu selangkah demi selangkah.</p></div>
            <div class="topic-tags"><span>Belajar</span><span>Konfigurasi</span><span>Simulasi</span></div>
        </template>
        <template id="panel-resources">
            <ol class="resource-list">
                <li><span>01</span><div><h3>Dasar Jaringan</h3><p>Mengenal perangkat, alamat IP, dan topologi jaringan.</p></div></li>
                <li><span>02</span><div><h3>Konfigurasi MikroTik</h3><p>Memahami antarmuka, DHCP, dan koneksi internet.</p></div></li>
                <li><span>03</span><div><h3>Routing &amp; Firewall</h3><p>Mengenal pengaturan rute dan keamanan jaringan.</p></div></li>
                <li><span>04</span><div><h3>Wireless &amp; Hotspot</h3><p>Mengenal jaringan nirkabel dan akses hotspot.</p></div></li>
            </ol>
        </template>
        <template id="panel-help">
            <div class="help-list">
                <details open><summary>Bagaimana cara memulai?</summary><p>Pilih Login atau Daftar untuk membuka form akun. Kamu bisa berpindah di antara kedua form melalui tautan di bagian bawah kartu.</p></details>
                <details><summary>Apakah bisa dibuka di HP?</summary><p>Bisa. Tampilan menyesuaikan ukuran layar dan menggunakan format landscape. Putar HP ke samping agar lebih nyaman.</p></details>
                <details><summary>Apa yang akan dipelajari?</summary><p>Dasar jaringan dan konfigurasi MikroTik. Lihat menu Materi Rujukan untuk mengenal topiknya.</p></details>
            </div>
        </template>
    </body>
</html>

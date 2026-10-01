<!DOCTYPE html>
<html lang="id" data-page="homepage">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0066ff">
        <meta name="description" content="Belajar jaringan jadi petualangan seru bersama NetGuard Academy. Jelajahi Adventure Mode, Practice Mode, dan Certification Mode.">
        <title>Beranda — NetGuard Academy</title>
        <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
        <link rel="preload" as="image" href="{{ asset('images/background/bghome2.png') }}" fetchpriority="high">
        <link rel="preload" as="image" href="{{ asset('images/asset/imghome.png') }}">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/homepage.css') }}?v={{ filemtime(public_path('css/homepage.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
        <script src="{{ asset('js/homepage.js') }}?v={{ filemtime(public_path('js/homepage.js')) }}" defer></script>
    </head>
    <body>
        <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <symbol id="icon-home" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 2 1.5 11h2.8v9.3c0 .9.7 1.7 1.7 1.7h4.2v-7h3.6v7H18c1 0 1.7-.8 1.7-1.7V11h2.8L12 2Z"/></symbol>
                <symbol id="icon-about" viewBox="0 0 24 24"><rect x="4" y="2.5" width="15" height="19" rx="2.5"/><path d="M8 7h7M8 11h7M8 15h4M19 6h2v12a2 2 0 0 1-2 2"/></symbol>
                <symbol id="icon-book" viewBox="0 0 24 24"><path d="M12 5c-3-3-7-3-10-1v17c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v16"/></symbol>
                <symbol id="icon-help" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M8.8 8a3.3 3.3 0 0 1 6.4 1c0 2.4-3.2 2.3-3.2 4.5M12 17h.01"/></symbol>
                <symbol id="home-gamepad" viewBox="0 0 32 24"><path d="M9 2h14c3 0 4.5 2 5.3 5L32 19c.9 4-3.5 6-6 3l-4-5H10l-4 5c-2.5 3-6.9 1-6-3L3.7 7C4.5 4 6 2 9 2Z" fill="currentColor" stroke="none"/><path d="M9 6v8M5 10h8" stroke="#fff" stroke-width="2.4"/><g fill="#fff" stroke="none"><circle cx="23" cy="6.5" r="1.5"/><circle cx="26.5" cy="10" r="1.5"/><circle cx="19.5" cy="10" r="1.5"/><circle cx="23" cy="13.5" r="1.5"/></g></symbol>
                <symbol id="home-progress" viewBox="0 0 24 24"><g fill="currentColor" stroke="none"><rect x="2" y="11" width="5" height="11" rx="2.5"/><rect x="9.5" y="2" width="5" height="20" rx="2.5"/><rect x="17" y="7" width="5" height="15" rx="2.5"/></g></symbol>
                <symbol id="home-team" viewBox="0 0 28 24"><g fill="currentColor" stroke="none"><circle cx="14" cy="6" r="4"/><circle cx="5" cy="8" r="3"/><circle cx="23" cy="8" r="3"/><path d="M7 22v-4a7 6 0 0 1 14 0v4ZM1 20v-4a4 4 0 0 1 6-3 9 9 0 0 0-2 7Zm26 0h-4a9 9 0 0 0-2-7 4 4 0 0 1 6 3Z"/></g></symbol>
                <symbol id="home-user" viewBox="0 0 24 24"><circle cx="12" cy="7" r="5" fill="currentColor" stroke="none"/><path d="M3 21v-2c0-4 4-6 9-6s9 2 9 6v2H3Z" fill="currentColor" stroke="none"/></symbol>
                <symbol id="home-logout" viewBox="0 0 24 24"><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 7l5 5-5 5M8 12h11"/></symbol>
                <symbol id="home-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" stroke-width="2.6"/></symbol>
                <symbol id="home-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
                <symbol id="home-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></symbol>
                <symbol id="home-star" viewBox="0 0 24 24"><path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8L2.2 9.2l6.8-1L12 2Z" fill="currentColor" stroke="none"/></symbol>
            </defs>
        </svg>

        <div class="academy-scene homepage-scene">
            <div class="homepage-scroll">
                <div class="homepage-canvas">
                    <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
                    <div class="classroom homepage-background" aria-hidden="true">
                        <img class="classroom__image" src="{{ asset('images/background/bghome2.png') }}" alt="" fetchpriority="high" decoding="async">
                    </div>

                    <header class="navbar homepage-navbar">
                        <a class="brand" href="{{ route('homepage') }}" aria-label="NetGuard Academy, Beranda" data-home>
                            <span class="brand__mascot"><img src="{{ asset('images/logo/logo.png') }}" alt="" decoding="async"></span>
                            <span class="brand__copy"><span class="brand__name">NetGuard <span>Academy</span></span><span class="brand__tagline">MikroTik Mission</span></span>
                        </a>
                        <nav class="nav-links" aria-label="Navigasi utama">
                            <a class="nav-link is-active" href="{{ route('homepage') }}" aria-current="page" data-home><svg class="icon" aria-hidden="true"><use href="#icon-home"/></svg><span>Beranda</span></a>
                            <button class="nav-link" type="button" data-home-panel="about" aria-haspopup="dialog" aria-controls="homepage-dialog"><svg class="icon" aria-hidden="true"><use href="#icon-about"/></svg><span>Tentang</span></button>
                            <button class="nav-link" type="button" data-home-panel="resources" aria-haspopup="dialog" aria-controls="homepage-dialog"><svg class="icon" aria-hidden="true"><use href="#icon-book"/></svg><span>Materi Rujukan</span></button>
                            <button class="nav-link" type="button" data-home-panel="help" aria-haspopup="dialog" aria-controls="homepage-dialog"><svg class="icon" aria-hidden="true"><use href="#icon-help"/></svg><span>Bantuan</span></button>
                        </nav>
                        <div class="homepage-account">
                            <button class="button button--primary navbar__login homepage-account__toggle" type="button" aria-expanded="false" aria-controls="homepage-account-menu"><svg class="icon" aria-hidden="true"><use href="#home-user"/></svg><span class="homepage-account__name">{{ auth()->user()->name }}</span><svg class="icon homepage-account__chevron" aria-hidden="true"><use href="#home-chevron"/></svg></button>
                            <div class="homepage-account__menu" id="homepage-account-menu" hidden>
                                <span class="homepage-account__label">Masuk sebagai</span>
                                <strong>{{ auth()->user()->name }}</strong>
                                <span class="homepage-account__email">{{ auth()->user()->email }}</span>
                                <form action="{{ route('logout') }}" method="post" data-logout>@csrf<button type="submit"><svg class="icon" aria-hidden="true"><use href="#home-logout"/></svg>Keluar</button></form>
                            </div>
                        </div>
                    </header>

                    <main id="main-content" tabindex="-1">
                        <section class="homepage-hero" aria-labelledby="homepage-title">
                            <img class="homepage-illustration" src="{{ asset('images/asset/imghome.png') }}" alt="" width="1536" height="1024" decoding="async" draggable="false" aria-hidden="true">
                            <p class="homepage-skill-note" aria-hidden="true"><svg class="icon"><use href="#home-star"/></svg><span>Upgrade Skill<br>Jadi Network Engineer!</span></p>
                            <div class="homepage-pixels" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
                            <div class="homepage-copy">
                                <p class="hero-badge" data-home-reveal><svg class="icon" aria-hidden="true"><use href="#home-gamepad"/></svg><span>Belajar Jaringan Jadi Petualangan Seru!</span><span class="hero-badge__spark" aria-hidden="true"></span></p>
                                <h1 class="homepage-title" id="homepage-title" data-home-reveal>NetGuard Academy:<span class="homepage-title__accent">MikroTik Mission<svg class="title-swoosh" viewBox="0 0 400 25" preserveAspectRatio="none" aria-hidden="true"><path d="M5 20Q180-10 394 18"/></svg></span></h1>
                                <p class="homepage-description" data-home-reveal>Belajar konfigurasi MikroTik melalui simulasi<br class="homepage-line-break"> interaktif dan misi menantang</p>
                                <ul class="homepage-benefits" aria-label="Belajar bersama NetGuard" data-home-reveal>
                                    <li><span class="benefit-icon"><svg class="icon" aria-hidden="true"><use href="#home-gamepad"/></svg></span><span>Simulasi<br>Interaktif</span></li>
                                    <li><span class="benefit-icon"><svg class="icon" aria-hidden="true"><use href="#home-progress"/></svg></span><span>Misi<br>Menantang</span></li>
                                    <li><span class="benefit-icon"><svg class="icon" aria-hidden="true"><use href="#home-team"/></svg></span><span>Belajar<br>Sambil Bermain</span></li>
                                </ul>
                            </div>
                            <svg class="homepage-waves" viewBox="0 0 1600 180" preserveAspectRatio="none" aria-hidden="true"><path d="M0 58C120 3 172 96 300 51S504 28 657 110 1020 144 1600 121V180H0Z" fill="#a8e4ff" fill-opacity=".8"/><path d="M0 98C117 25 164 113 301 87S466 20 632 107 1100 136 1600 150V180H0Z" fill="#49b6ff" fill-opacity=".72"/><path d="M0 160C114 88 265 109 441 146S1080 140 1600 169V180H0Z" fill="#c9eeff" fill-opacity=".8"/></svg>
                        </section>

                        <section class="homepage-modes" id="fitur" aria-labelledby="modes-title" tabindex="-1">
                            <h2 class="visually-hidden" id="modes-title">Pilih mode belajarmu</h2>
                            <div class="mode-grid">
                                <a class="mode-card" href="{{ route('adventure') }}" data-adventure-link aria-labelledby="adventure-title" aria-describedby="adventure-description">
                                    <img class="mode-card__art" src="{{ asset('images/card/advanture.png') }}" alt="" width="2172" height="724" decoding="async" draggable="false">
                                    <span class="mode-card__ribbon">Petualangan Jaringan</span>
                                    <span class="mode-card__copy"><span class="mode-card__title" id="adventure-title"><span>Adventure</span> Mode</span><span class="mode-card__description" id="adventure-description">Jelajahi cerita dan selesaikan misi jaringan selangkah demi selangkah.</span></span>
                                    <span class="mode-card__meta"><svg class="icon" aria-hidden="true"><use href="#icon-book"/></svg>5 Chapter</span>
                                    <span class="mode-card__action">Pilih Chapter <svg class="icon" aria-hidden="true"><use href="#home-chevron"/></svg></span>
                                </a>
                                <button class="mode-card" type="button" data-home-panel="practice" aria-haspopup="dialog" aria-controls="homepage-dialog" aria-labelledby="practice-title" aria-describedby="practice-description">
                                    <img class="mode-card__art" src="{{ asset('images/card/practice.png') }}" alt="" width="2172" height="724" decoding="async" draggable="false">
                                    <span class="mode-card__ribbon">Latihan Konfigurasi</span>
                                    <span class="mode-card__copy"><span class="mode-card__title" id="practice-title"><span>Practice</span> Mode</span><span class="mode-card__description" id="practice-description">Latih konfigurasi MikroTik dan tingkatkan keterampilan jaringanmu.</span></span>
                                    <span class="mode-card__meta"><svg class="icon" aria-hidden="true"><use href="#home-progress"/></svg>Per Topik</span>
                                    <span class="mode-card__action">Lihat Mode <svg class="icon" aria-hidden="true"><use href="#home-chevron"/></svg></span>
                                </button>
                                <button class="mode-card" type="button" data-home-panel="certification" aria-haspopup="dialog" aria-controls="homepage-dialog" aria-labelledby="certification-title" aria-describedby="certification-description">
                                    <img class="mode-card__art" src="{{ asset('images/card/sertifikat.png') }}" alt="" width="2172" height="724" decoding="async" draggable="false">
                                    <span class="mode-card__ribbon">Tantangan Akhir</span>
                                    <span class="mode-card__copy"><span class="mode-card__title" id="certification-title"><span>Certification</span> Mode</span><span class="mode-card__description" id="certification-description">Uji kemampuan melalui studi kasus jaringan secara mandiri.</span></span>
                                    <span class="mode-card__meta"><svg class="icon" aria-hidden="true"><use href="#home-star"/></svg>Studi Kasus</span>
                                    <span class="mode-card__action">Lihat Mode <svg class="icon" aria-hidden="true"><use href="#home-chevron"/></svg></span>
                                </button>
                            </div>
                            <footer class="homepage-footer"><span>© {{ date('Y') }} NetGuard Academy: MikroTik Mission. All rights reserved.</span></footer>
                        </section>
                    </main>
                </div>
            </div>
            <div class="homepage-loading" role="status" aria-live="polite" aria-atomic="true" hidden>
                <img src="{{ asset('images/asset/netguard_mikrotik_infinity_loader.svg') }}" alt="" width="320" height="320" decoding="async">
                <p class="homepage-loading__message">Menyiapkan mode belajar...</p>
            </div>
        </div>

        <dialog class="information-dialog homepage-dialog" id="homepage-dialog" aria-labelledby="home-panel-title" aria-describedby="home-panel-description">
            <button class="dialog-close" type="button" aria-label="Tutup panel"><svg class="icon" aria-hidden="true"><use href="#home-close"/></svg></button>
            <div class="dialog-heading">
                <span class="dialog-emblem"><svg class="icon" aria-hidden="true"><use href="#home-info"/></svg></span>
                <p class="eyebrow">NETGUARD ACADEMY</p>
                <h2 id="home-panel-title"></h2><p id="home-panel-description"></p>
            </div>
            <div id="home-panel-content"></div>
            <button class="button button--primary dialog-back" type="button">Kembali ke Beranda <svg class="icon" aria-hidden="true"><use href="#home-chevron"/></svg></button>
        </dialog>

        <template id="home-panel-about"><div class="about-note"><span class="note-number">BELAJAR JARINGAN, SELANGKAH DEMI SELANGKAH</span><p>NetGuard Academy mengajakmu mengenal jaringan dan konfigurasi MikroTik melalui petualangan, latihan, dan tantangan.</p></div><div class="topic-tags"><span>Routing</span><span>Firewall</span><span>Hotspot</span><span>VLAN &amp; QoS</span></div></template>
        <template id="home-panel-resources"><ol class="resource-list"><li><span>01</span><div><h3>Dasar Jaringan</h3><p>Mengenal perangkat, alamat IP, dan topologi jaringan.</p></div></li><li><span>02</span><div><h3>Konfigurasi MikroTik</h3><p>Memahami antarmuka, DHCP, dan koneksi internet.</p></div></li><li><span>03</span><div><h3>Routing &amp; Firewall</h3><p>Mengenal pengaturan rute dan keamanan jaringan.</p></div></li><li><span>04</span><div><h3>Wireless &amp; Hotspot</h3><p>Mengenal jaringan nirkabel dan akses hotspot.</p></div></li></ol><button class="button button--outline homepage-resource-link" type="button" data-home-panel="leaderboard">Lihat Leaderboard</button></template>
        <template id="home-panel-leaderboard"><div class="about-note"><span class="note-number">PETUALANGAN AKAN SEGERA DIMULAI</span><p>Belum ada peringkat untuk ditampilkan. Leaderboard akan tersedia saat misi dan penilaian sudah dibuka.</p></div></template>
        <template id="home-panel-help"><div class="help-list"><details open><summary>Bagaimana cara memilih mode?</summary><p>Pilih Adventure Mode untuk melihat lima chapter. Kartu Practice dan Certification menampilkan informasi mode masing-masing.</p></details><details><summary>Apakah misi sudah bisa dimainkan?</summary><p>Chapter Adventure sudah dapat dijelajahi, tetapi misi interaktifnya masih disiapkan. Practice dan Certification juga belum dibuka.</p></details><details><summary>Bagaimana tampilan di HP?</summary><p>Tampilan menyesuaikan ke posisi landscape. Pilih kartu mode di bagian bawah untuk melihat rinciannya.</p></details></div></template>
        <template id="home-panel-practice"><div class="about-note"><span class="note-number">PRACTICE MODE · SEGERA HADIR</span><p>Kenali konfigurasi MikroTik lewat latihan jaringan dan simulasi. Area latihan belum dibuka.</p></div><div class="topic-tags"><span>Konfigurasi IP</span><span>DHCP</span><span>Routing</span></div></template>
        <template id="home-panel-certification"><div class="about-note"><span class="note-number">CERTIFICATION MODE · SEGERA HADIR</span><p>Uji pemahaman dan keterampilan konfigurasi melalui tantangan khusus. Ujian dan penerbitan sertifikat belum dibuka.</p></div><div class="topic-tags"><span>Uji kemampuan</span><span>Tantangan khusus</span><span>Sertifikat</span></div></template>
    </body>
</html>

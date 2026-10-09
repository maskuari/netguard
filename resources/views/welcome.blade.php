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
        <link rel="preload" as="image" href="{{ asset('images/card/netguard.png') }}" fetchpriority="high">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <link rel="prefetch" as="image" href="{{ asset('images/asset/netlogin.png') }}">
        <link rel="prefetch" as="image" href="{{ asset('images/card/cardlog.png') }}">
        <link rel="prefetch" as="style" href="{{ asset('css/auth.css') }}?v={{ filemtime(public_path('css/auth.css')) }}">
        <link rel="prefetch" as="script" href="{{ asset('js/auth.js') }}?v={{ filemtime(public_path('js/auth.js')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
    </head>
    <body>
        <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <symbol id="icon-user-add" viewBox="0 0 28 24">
                    <circle cx="10" cy="6" r="5" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M1 21v-2a9 7 0 0 1 18 0v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"/><path d="M23 7v8M19 11h8" stroke-width="2.7"/>
                </symbol>
                <symbol id="icon-gamepad" viewBox="0 0 32 24">
                    <path fill="currentColor" stroke="none" d="M9 2h14c3 0 4.5 2 5.3 5L32 19c.9 4-3.5 6-6 3l-4-5H10l-4 5c-2.5 3-6.9 1-6-3L3.7 7C4.5 4 6 2 9 2Z"/>
                    <path d="M9 6v8M5 10h8" stroke="var(--button-fill, #0066ff)" stroke-width="2.4"/>
                    <g fill="var(--button-fill, #0066ff)" stroke="none"><circle cx="23" cy="6.5" r="1.5"/><circle cx="26.5" cy="10" r="1.5"/><circle cx="19.5" cy="10" r="1.5"/><circle cx="23" cy="13.5" r="1.5"/></g>
                </symbol>
            </defs>
        </svg>

        <div class="academy-scene welcome-scene">
            <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
            <div class="classroom" aria-hidden="true">
                <img class="classroom__image" src="{{ asset('images/background/home.png') }}" alt="" fetchpriority="high" decoding="async">
            </div>
            <main class="hero" id="main-content" tabindex="-1">
                <h1 class="visually-hidden">NetGuard Academy — MikroTik Mission</h1>
                <p class="visually-hidden">Belajar konfigurasi MikroTik melalui simulasi interaktif dan misi menantang.</p>
                <div class="mission-card">
                    <img class="mission-card__art" src="{{ asset('images/card/netguard.png') }}" alt="" fetchpriority="high" decoding="async" draggable="false">
                    <div class="mission-card__actions" aria-label="Mulai petualanganmu">
                        <a class="button button--primary mission-button" href="{{ route('login') }}" data-page-link="login"><svg class="icon icon--gamepad" aria-hidden="true"><use href="#icon-gamepad"/></svg><span>Login</span></a>
                        <a class="button button--outline mission-button" href="{{ route('register') }}" data-page-link="register"><svg class="icon icon--add" aria-hidden="true"><use href="#icon-user-add"/></svg><span>Daftar</span></a>
                    </div>
                </div>
            </main>

        </div>
    </body>
</html>

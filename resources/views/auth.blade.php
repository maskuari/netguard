<!DOCTYPE html>
<html lang="id" data-page="auth" data-auth-mode="{{ $mode }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0066ff">
        <meta name="description" content="Mulai petualangan belajar MikroTik bersama NetGuard Academy.">
        <title>{{ $mode === 'register' ? 'Register' : 'Login' }} — NetGuard Academy</title>
        <link rel="icon" type="image/png" href="{{ asset('images/logo/logo.png') }}">
        <link rel="preload" as="image" href="{{ asset('images/background/home.png') }}" fetchpriority="high">
        <link rel="preload" as="image" href="{{ asset('images/asset/netlogin.png') }}" fetchpriority="high">
        <link rel="preload" as="image" href="{{ asset('images/card/cardlog.png') }}" fetchpriority="high">
        <link rel="stylesheet" href="{{ asset('css/welcome.css') }}?v={{ filemtime(public_path('css/welcome.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/auth.css') }}?v={{ filemtime(public_path('css/auth.css')) }}">
        <link rel="stylesheet" href="{{ asset('css/page-transitions.css') }}?v={{ filemtime(public_path('css/page-transitions.css')) }}">
        <link rel="prefetch" as="image" href="{{ asset('images/background/bghome2.png') }}">
        <link rel="prefetch" as="image" href="{{ asset('images/asset/imghome.png') }}">
        <link rel="prefetch" as="style" href="{{ asset('css/homepage.css') }}?v={{ filemtime(public_path('css/homepage.css')) }}">
        <link rel="prefetch" as="script" href="{{ asset('js/homepage.js') }}?v={{ filemtime(public_path('js/homepage.js')) }}">
        <script src="{{ asset('js/page-transitions.js') }}?v={{ filemtime(public_path('js/page-transitions.js')) }}"></script>
        <script src="{{ asset('js/auth.js') }}?v={{ filemtime(public_path('js/auth.js')) }}" defer></script>
    </head>
    <body>
        <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <symbol id="auth-cap" viewBox="0 0 64 56"><path d="M3 19 32 4l29 15-29 16L3 19Z" fill="#04134d" stroke="#0066ff" stroke-width="1.7"/><path d="M14 28v15l18 10 18-10V28L32 38 14 28Z" fill="#051b6c" stroke="#0066ff" stroke-width="1.7"/><path d="M59 21v22" stroke="#0066ff" stroke-width="3"/><circle cx="59" cy="44" r="2.5" fill="#0066ff"/></symbol>
                <symbol id="auth-user" viewBox="0 0 24 24"><circle cx="12" cy="7" r="5" fill="currentColor" stroke="none"/><path d="M3 21v-2c0-4 4-6 9-6s9 2 9 6v2H3Z" fill="currentColor" stroke="none"/></symbol>
                <symbol id="auth-lock" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="12" rx="2.5" fill="currentColor" stroke="none"/><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke-width="2.5"/><path d="M12 15v3" stroke="white" stroke-width="2"/></symbol>
                <symbol id="auth-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2.5" fill="currentColor" stroke="none"/><path d="m3 6 9 7 9-7" stroke="white" stroke-width="1.8"/></symbol>
                <symbol id="auth-eye" viewBox="0 0 24 24"><path d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></symbol>
                <symbol id="auth-eye-off" viewBox="0 0 24 24"><path d="m3 3 18 18M9.5 5.3A11 11 0 0 1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3 3.8M6.2 6.2A21 21 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.8-1.8M10 10a3 3 0 0 0 4 4"/></symbol>
                <symbol id="auth-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" stroke-width="3"/></symbol>
                <symbol id="auth-back" viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></symbol>
                <symbol id="auth-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
                <symbol id="auth-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></symbol>
                <symbol id="auth-gamepad" viewBox="0 0 32 24"><path fill="currentColor" stroke="none" d="M9 2h14c3 0 4.5 2 5.3 5L32 19c.9 4-3.5 6-6 3l-4-5H10l-4 5c-2.5 3-6.9 1-6-3L3.7 7C4.5 4 6 2 9 2Z"/><path d="M9 6v8M5 10h8" stroke="var(--button-fill, #0066ff)" stroke-width="2.4"/><g fill="var(--button-fill, #0066ff)" stroke="none"><circle cx="23" cy="6.5" r="1.5"/><circle cx="26.5" cy="10" r="1.5"/><circle cx="19.5" cy="10" r="1.5"/><circle cx="23" cy="13.5" r="1.5"/></g></symbol>
            </defs>
        </svg>

        <div class="academy-scene auth-scene" data-mode="{{ $mode }}" data-login-url="{{ route('login') }}" data-register-url="{{ route('register') }}">
            <div class="classroom auth-background" aria-hidden="true"><img class="classroom__image" src="{{ asset('images/background/home.png') }}" alt="" fetchpriority="high" decoding="async"></div>
            <div class="auth-atmosphere" aria-hidden="true"></div>
            <div class="sun-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>

            <a class="auth-home" href="{{ route('home') }}" data-page-link="welcome"><svg class="icon" aria-hidden="true"><use href="#auth-back"/></svg><span>Beranda</span></a>

            <main class="auth-stage" aria-label="Akun NetGuard Academy">
                <div class="auth-brand">
                    <div class="auth-brand__motion">
                        <img class="auth-brand__image" src="{{ asset('images/asset/netlogin.png') }}" alt="NetGuard Academy — MikroTik Mission. Belajar konfigurasi MikroTik melalui simulasi interaktif dan misi menantang. Routing, Firewall, Hotspot, VLAN dan QoS." fetchpriority="high" decoding="async" draggable="false">
                    </div>
                </div>

                <div class="auth-card">
                    <div class="auth-card__surface">
                        <img class="auth-card__frame" src="{{ asset('images/card/cardlog.png') }}" alt="" fetchpriority="high" decoding="async" draggable="false">

                        <section class="auth-pane" data-pane="login" aria-labelledby="login-title" @if ($mode !== 'login') hidden inert aria-hidden="true" @endif>
                            <form class="auth-form auth-form--login" action="{{ route('login.attempt') }}" method="post" data-auth-form="login" novalidate>
                                @csrf
                                <div class="auth-heading" data-reveal>
                                    <svg class="auth-heading__icon" aria-hidden="true"><use href="#auth-cap"/></svg>
                                    <div><h1 id="login-title" tabindex="-1">Login</h1><h2>Masuk ke NetGuard Academy</h2><p>Lanjutkan petualangan belajar MikroTik<br class="desktop-break"> dan selesaikan misi berikutnya!</p></div>
                                </div>
                                <div class="auth-fields-scroll">
                                <div class="auth-fields login-fields">
                                    <label class="auth-input" data-reveal><span class="visually-hidden">Email</span><svg class="icon" aria-hidden="true"><use href="#auth-mail"/></svg><input name="email" type="email" placeholder="Email" autocomplete="email" autocapitalize="none" spellcheck="false" required maxlength="255" value="{{ old('email') }}"></label>
                                    <div class="auth-input" data-reveal><label class="visually-hidden" for="login-password">Password</label><svg class="icon" aria-hidden="true"><use href="#auth-lock"/></svg><input id="login-password" name="password" type="password" placeholder="Password" autocomplete="current-password" required><button class="password-toggle" type="button" aria-label="Tampilkan password" aria-controls="login-password" aria-pressed="false"><svg class="icon" aria-hidden="true"><use href="#auth-eye-off"/></svg></button></div>
                                </div>
                                <div class="login-options" data-reveal>
                                    <label class="remember-me"><input type="checkbox" name="remember" checked><span class="remember-me__box"><svg class="icon" aria-hidden="true"><use href="#auth-check"/></svg></span><span>Ingat saya</span></label>
                                    <button class="text-link forgot-password" type="button" aria-haspopup="dialog" aria-controls="forgot-dialog">Lupa password?</button>
                                </div>
                                </div>
                                <button class="button button--primary auth-submit" type="submit" data-submit data-reveal disabled><svg class="icon" aria-hidden="true"><use href="#auth-gamepad"/></svg><span>Login</span></button>
                                <p class="auth-switch-row" data-reveal>Belum punya akun? <a class="text-link" href="{{ route('register') }}" data-switch="register">Daftar</a></p>
                            </form>
                        </section>

                        <section class="auth-pane" data-pane="register" aria-labelledby="register-title" @if ($mode !== 'register') hidden inert aria-hidden="true" @endif>
                            <form class="auth-form auth-form--register" action="{{ route('register.store') }}" method="post" data-auth-form="register" novalidate>
                                @csrf
                                <div class="auth-heading" data-reveal>
                                    <svg class="auth-heading__icon" aria-hidden="true"><use href="#auth-cap"/></svg>
                                    <div><h1 id="register-title" tabindex="-1">Register</h1><h2>Buat akun NetGuard Academy</h2><p>Mulai petualangan belajar MikroTik melalui<br class="desktop-break"> simulasi interaktif dan misi menantang!</p></div>
                                </div>
                                <div class="auth-fields-scroll">
                                <div class="auth-fields register-fields">
                                    <label class="auth-input" data-reveal><span class="visually-hidden">Nama lengkap</span><svg class="icon" aria-hidden="true"><use href="#auth-user"/></svg><input name="name" type="text" placeholder="Nama lengkap" autocomplete="name" required maxlength="255" value="{{ old('name') }}"></label>
                                    <label class="auth-input" data-reveal><span class="visually-hidden">Email</span><svg class="icon" aria-hidden="true"><use href="#auth-mail"/></svg><input name="email" type="email" placeholder="Email" autocomplete="email" autocapitalize="none" spellcheck="false" required maxlength="255" value="{{ old('email') }}"></label>
                                    <div class="auth-input" data-reveal><label class="visually-hidden" for="register-password">Password, minimal 8 karakter</label><svg class="icon" aria-hidden="true"><use href="#auth-lock"/></svg><input id="register-password" name="password" type="password" placeholder="Password" autocomplete="new-password" required minlength="8"><button class="password-toggle" type="button" aria-label="Tampilkan password" aria-controls="register-password" aria-pressed="false"><svg class="icon" aria-hidden="true"><use href="#auth-eye-off"/></svg></button></div>
                                    <div class="auth-input" data-reveal><label class="visually-hidden" for="register-confirmation">Konfirmasi password</label><svg class="icon" aria-hidden="true"><use href="#auth-lock"/></svg><input id="register-confirmation" name="password_confirmation" type="password" placeholder="Konfirmasi password" autocomplete="new-password" required minlength="8"><button class="password-toggle" type="button" aria-label="Tampilkan konfirmasi password" aria-controls="register-confirmation" aria-pressed="false"><svg class="icon" aria-hidden="true"><use href="#auth-eye-off"/></svg></button></div>
                                </div>
                                </div>
                                <button class="button button--primary auth-submit" type="submit" data-submit data-reveal disabled><svg class="icon" aria-hidden="true"><use href="#auth-gamepad"/></svg><span>Daftar</span></button>
                                <p class="auth-switch-row" data-reveal>Sudah punya akun? <a class="text-link" href="{{ route('login') }}" data-switch="login">Login</a></p>
                            </form>
                        </section>
                    </div>
                </div>
            </main>

            <div class="auth-loading" role="status" aria-live="polite" aria-atomic="true" hidden>
                <img src="{{ asset('images/asset/netguard_mikrotik_infinity_loader.svg') }}" alt="" width="320" height="320" decoding="async">
                <p class="auth-loading__message">Memproses akunmu...</p>
            </div>
            <div class="toast auth-toast" data-tone="{{ session('status') ? 'success' : 'error' }}" role="alert" aria-live="assertive" aria-atomic="true" @if (! $errors->any() && ! session('status')) hidden @endif><svg class="icon" aria-hidden="true"><use href="{{ session('status') ? '#auth-check' : '#auth-info' }}"/></svg><span class="toast__message">{{ $errors->first() ?: session('status') }}</span><button class="toast__close" type="button" aria-label="Tutup pemberitahuan"><svg class="icon" aria-hidden="true"><use href="#auth-close"/></svg></button></div>
            <noscript><p class="auth-noscript">Aktifkan JavaScript untuk menggunakan form dan animasi. <a href="{{ $mode === 'login' ? route('register') : route('login') }}">{{ $mode === 'login' ? 'Buka Register' : 'Buka Login' }}</a></p></noscript>
        </div>

        <dialog class="information-dialog" id="forgot-dialog" aria-labelledby="forgot-title" aria-describedby="forgot-description">
            <button class="dialog-close" type="button" aria-label="Tutup panel"><svg class="icon" aria-hidden="true"><use href="#auth-close"/></svg></button>
            <div class="dialog-heading"><span class="dialog-emblem"><svg class="icon" aria-hidden="true"><use href="#auth-lock"/></svg></span><p class="eyebrow">NETGUARD ACADEMY</p><h2 id="forgot-title">Lupa password?</h2><p id="forgot-description">Pemulihan password belum tersedia. Silakan hubungi pengelola NetGuard Academy untuk bantuan akun.</p></div>
            <button class="button button--primary dialog-back" type="button">Kembali ke Login</button>
        </dialog>
    </body>
</html>

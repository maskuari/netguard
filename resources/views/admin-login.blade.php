<!DOCTYPE html>
<html lang="id" data-page="admin-login">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0768ed">
        <title>Login Admin — NetGuard Academy</title>
        <link rel="icon" href="{{ asset('images/logo/logo.png') }}">
        <link rel="stylesheet" href="{{ asset('css/admin.css') }}?v={{ filemtime(public_path('css/admin.css')) }}">
        <script src="{{ asset('js/admin.js') }}?v={{ filemtime(public_path('js/admin.js')) }}" defer></script>
    </head>
    <body class="admin-login-body">
        @include('admin-icons')
        <main class="admin-login-scene">
            <section class="admin-login-brand">
                <a class="admin-brand" href="{{ route('home') }}"><span class="admin-brand__mascot"><img src="{{ asset('images/logo/logo.png') }}" alt="" decoding="async"></span><span class="admin-brand__copy"><strong class="admin-brand__name">NetGuard Academy</strong><small class="admin-brand__tagline">MikroTik Mission</small></span></a>
                <div class="admin-login-content"><span class="admin-login-mark"><svg class="admin-icon"><use href="#admin-shield"/></svg></span><p class="admin-eyebrow">ADMINISTRATION PORTAL</p><h1>Kelola belajar.<br>Pantau kemajuan.</h1><p>Satu ruang untuk mengelola akun, memantau progres Adventure, dan mencatat pencapaian siswa.</p><div class="admin-actions"><span class="admin-status"><svg class="admin-icon"><use href="#admin-users"/></svg>Manajemen akun</span><span class="admin-status"><svg class="admin-icon"><use href="#admin-chart"/></svg>Progres &amp; nilai</span></div></div>
                <p class="admin-login-footer">© {{ date('Y') }} NetGuard Academy</p>
            </section>
            <section class="admin-login-panel" aria-labelledby="admin-login-title">
                <div class="admin-login-card">
                    <p class="admin-eyebrow">SELAMAT DATANG KEMBALI</p><h2 id="admin-login-title">Login administrator</h2><p class="admin-page-description">Masuk untuk mengelola NetGuard Academy.</p>
                    <div class="admin-notice admin-notice--error" id="admin-login-error" role="alert" @if (! $errors->any()) hidden @endif>{{ $errors->first() }}</div>
                    @if (session('status'))<div class="admin-notice admin-notice--success" role="status">{{ session('status') }}</div>@endif
                    <form class="admin-login-form" action="{{ route('admin.login.attempt') }}" method="post" data-admin-login>
                        @csrf
                        <label class="admin-field">Email admin<input type="email" name="email" autocomplete="username" value="{{ old('email') }}" placeholder="admin@netguard.com" required maxlength="255" autofocus></label>
                        <label class="admin-field">Password<input type="password" name="password" id="admin-login-password" autocomplete="current-password" placeholder="Masukkan password" required></label>
                        <button class="admin-button admin-button--ghost admin-password-toggle" type="button" data-password-target="admin-login-password" aria-controls="admin-login-password" aria-pressed="false">Tampilkan password</button>
                        <button class="admin-button admin-button--primary" type="submit" data-submit>Masuk ke panel admin <svg class="admin-icon"><use href="#admin-arrow"/></svg></button>
                    </form>
                    <p class="admin-help"><svg class="admin-icon"><use href="#admin-lock"/></svg>Khusus akun administrator.</p>
                    <a class="admin-button admin-button--ghost" href="{{ route('login') }}"><svg class="admin-icon"><use href="#admin-back"/></svg>Kembali ke login siswa</a>
                </div>
            </section>
        </main>
        <div class="admin-loading" data-admin-loading role="status" aria-live="polite" aria-atomic="true" hidden><img src="{{ asset('images/asset/netguard_mikrotik_infinity_loader.svg') }}" alt="" width="160" height="160"><p class="admin-loading-message" data-loading-message>Memeriksa akun admin...</p></div>
    </body>
</html>

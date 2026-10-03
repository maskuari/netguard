<!DOCTYPE html>
<html lang="id" data-page="admin">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#0768ed">
        <title>@yield('title', 'Dashboard') — Admin NetGuard Academy</title>
        <link rel="icon" href="{{ asset('images/logo/logo.png') }}">
        <link rel="stylesheet" href="{{ asset('css/admin.css') }}?v={{ filemtime(public_path('css/admin.css')) }}">
        <script src="{{ asset('js/admin.js') }}?v={{ filemtime(public_path('js/admin.js')) }}" defer></script>
    </head>
    <body class="admin-body">
        @include('admin-icons')
        <aside class="admin-sidebar" id="admin-sidebar" aria-label="Menu administrasi">
            <a class="admin-brand" href="{{ route('admin.dashboard') }}">
                <span class="admin-brand__mascot"><img src="{{ asset('images/logo/logo.png') }}" alt="" decoding="async"></span>
                <span class="admin-brand__copy"><strong class="admin-brand__name">NetGuard<span> Academy</span></strong><small class="admin-brand__tagline">Administration</small></span>
            </a>
            <p class="admin-section-label">WORKSPACE</p>
            <nav class="admin-nav">
                <a class="admin-nav-link{{ request()->routeIs('admin.dashboard') ? ' is-active' : '' }}" href="{{ route('admin.dashboard') }}"><svg class="admin-icon"><use href="#admin-grid"/></svg>Dashboard</a>
                <a class="admin-nav-link{{ request()->routeIs('admin.users.*') ? ' is-active' : '' }}" href="{{ route('admin.dashboard') }}#accounts"><svg class="admin-icon"><use href="#admin-users"/></svg>Kelola akun</a>
                <a class="admin-nav-link" href="{{ route('admin.dashboard') }}#progress"><svg class="admin-icon"><use href="#admin-chart"/></svg>Progres &amp; nilai</a>
                <a class="admin-nav-link" href="{{ route('admin.dashboard') }}#activity"><svg class="admin-icon"><use href="#admin-clock"/></svg>Riwayat aktivitas</a>
            </nav>
            <div class="admin-sidebar__footer">
                <span class="admin-status is-active"><svg class="admin-icon"><use href="#admin-shield"/></svg>Akses administrator</span>
                <p>Ruang pengelolaan akun dan perjalanan belajar NetGuard Academy.</p>
            </div>
        </aside>
        <div class="admin-shell">
            <header class="admin-topbar">
                <div class="admin-topbar__title"><button class="admin-button admin-button--ghost" type="button" data-sidebar-toggle aria-label="Buka menu" aria-expanded="false" aria-controls="admin-sidebar"><svg class="admin-icon"><use href="#admin-menu"/></svg></button><span>Admin <span aria-hidden="true">/</span> @yield('title', 'Dashboard')</span></div>
                <div class="admin-topbar__actions">
                    <a class="admin-button admin-button--ghost" href="{{ route('homepage') }}"><svg class="admin-icon"><use href="#admin-external"/></svg><span>Lihat website</span></a>
                    <button class="admin-user-chip" type="button" data-open-dialog="admin-password-dialog" aria-haspopup="dialog"><span class="admin-avatar"><svg class="admin-icon"><use href="#admin-shield"/></svg></span><span><strong>{{ auth()->user()->name }}</strong><small>Administrator</small></span></button>
                    <form action="{{ route('logout') }}" method="post" data-admin-action data-loading-label="Keluar dari akun admin...">@csrf<button class="admin-button admin-button--ghost" type="submit" aria-label="Keluar dari akun"><svg class="admin-icon"><use href="#admin-logout"/></svg></button></form>
                </div>
            </header>
            <main class="admin-main" id="admin-main">
                @if (session('status'))
                    <div class="admin-notice admin-notice--success" role="status" data-admin-toast><svg class="admin-icon"><use href="#admin-check"/></svg><span>{{ session('status') }}</span><button type="button" data-toast-dismiss aria-label="Tutup pemberitahuan"><svg class="admin-icon"><use href="#admin-close"/></svg></button></div>
                @endif
                @if ($errors->any())
                    <div class="admin-notice admin-notice--error" role="alert"><div><strong>Periksa kembali data yang diisi.</strong><ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div></div>
                @endif
                @yield('content')
            </main>
        </div>
        <dialog class="admin-dialog" id="admin-password-dialog" aria-labelledby="admin-password-title" @if ($errors->any() && old('_form') === 'password') data-open-on-load @endif>
            <div class="admin-card__heading"><div><p class="admin-eyebrow">AKUN ADMIN</p><h2 id="admin-password-title">Ganti password</h2></div><button class="admin-button admin-button--ghost" type="button" data-close-dialog aria-label="Tutup"><svg class="admin-icon"><use href="#admin-close"/></svg></button></div>
            <form action="{{ route('admin.password.update') }}" method="post" data-admin-action data-loading-label="Menyimpan password baru...">
                @csrf @method('PUT')
                <input type="hidden" name="_form" value="password">
                <div class="admin-form-grid">
                    <label class="admin-field admin-field--wide">Password saat ini<input name="current_password" type="password" autocomplete="current-password" required></label>
                    <label class="admin-field">Password baru<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>
                    <label class="admin-field">Ulangi password baru<input name="password_confirmation" type="password" minlength="8" autocomplete="new-password" required></label>
                </div>
                <p class="admin-help">Gunakan minimal 8 karakter.</p>
                <div class="admin-actions"><button class="admin-button admin-button--secondary" type="button" data-close-dialog>Batal</button><button class="admin-button admin-button--primary" type="submit">Simpan password</button></div>
            </form>
        </dialog>
        @yield('dialogs')
        <div class="admin-loading" data-admin-loading role="status" aria-live="polite" aria-atomic="true" hidden><img src="{{ asset('images/asset/netguard_mikrotik_infinity_loader.svg') }}" alt="" width="160" height="160"><p class="admin-loading-message" data-loading-message>Memproses...</p></div>
    </body>
</html>

@php
    $isWelcome = $page === 'welcome';
    $isAdventure = $page === 'adventure';
    $homeUrl = $isWelcome ? url('/') : route('homepage');
    $dialogId = $isWelcome ? 'information-dialog' : ($isAdventure ? 'adventure-dialog' : 'homepage-dialog');
    $panelAttribute = $isWelcome ? 'data-panel' : ($isAdventure ? 'data-adventure-info' : 'data-home-panel');
    $account = $isWelcome ? null : auth()->user();
@endphp
<header class="navbar game-navbar{{ $isAdventure ? ' adventure-navbar' : ($isWelcome ? '' : ' homepage-navbar') }}">
    <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <symbol id="navbar-home" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 2 1.5 11h2.8v9.3c0 .9.7 1.7 1.7 1.7h4.2v-7h3.6v7H18c1 0 1.7-.8 1.7-1.7V11h2.8L12 2Z"/></symbol>
            <symbol id="navbar-materials" viewBox="0 0 24 24"><path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V3Zm0 15a3 3 0 0 1 3-3h11M9 7h6M9 10h6"/></symbol>
            <symbol id="navbar-about" viewBox="0 0 24 24"><rect x="4" y="2.5" width="15" height="19" rx="2.5"/><path d="M8 7h7M8 11h7M8 15h4M19 6h2v12a2 2 0 0 1-2 2"/></symbol>
            <symbol id="navbar-book" viewBox="0 0 24 24"><path d="M12 5c-3-3-7-3-10-1v17c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v16"/></symbol>
            <symbol id="navbar-help" viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><path d="M8.8 8a3.3 3.3 0 0 1 6.4 1c0 2.4-3.2 2.3-3.2 4.5M12 17h.01"/></symbol>
            <symbol id="navbar-user" viewBox="0 0 24 24"><circle cx="12" cy="6.6" r="5" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M3 21v-2a9 7 0 0 1 18 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/></symbol>
            <symbol id="navbar-chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
            <symbol id="navbar-logout" viewBox="0 0 24 24"><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 7l5 5-5 5M8 12h11"/></symbol>
        </defs>
    </svg>
    <a class="brand" href="{{ $homeUrl }}" aria-label="NetGuard Academy, Beranda" @if ($isAdventure) data-page-link="homepage" @else data-home @endif>
        <span class="brand__mascot"><img src="{{ asset('images/logo/logo.png') }}" alt="" decoding="async"></span>
        <span class="brand__copy"><span class="brand__name">NetGuard <span>Academy</span></span><span class="brand__tagline">MikroTik Mission</span></span>
    </a>
    <nav class="nav-links" aria-label="Navigasi utama">
        <a class="nav-link{{ $isAdventure ? '' : ' is-active' }}" href="{{ $homeUrl }}" @if (! $isAdventure) aria-current="page" data-home @else data-page-link="homepage" @endif><svg class="icon" aria-hidden="true"><use href="#navbar-home"/></svg><span>Beranda</span></a>
        <button class="nav-link{{ $isAdventure ? ' is-active' : '' }}" type="button" {{ $panelAttribute }}="materials" @if ($isAdventure) aria-current="page" @endif aria-haspopup="dialog" aria-controls="{{ $dialogId }}"><svg class="icon" aria-hidden="true"><use href="#navbar-materials"/></svg><span>Materi</span></button>
        <button class="nav-link" type="button" {{ $panelAttribute }}="about" aria-haspopup="dialog" aria-controls="{{ $dialogId }}"><svg class="icon" aria-hidden="true"><use href="#navbar-about"/></svg><span>Tentang</span></button>
        <button class="nav-link" type="button" {{ $panelAttribute }}="resources" aria-haspopup="dialog" aria-controls="{{ $dialogId }}"><svg class="icon" aria-hidden="true"><use href="#navbar-book"/></svg><span>Materi Rujukan</span></button>
        <button class="nav-link" type="button" {{ $panelAttribute }}="help" aria-haspopup="dialog" aria-controls="{{ $dialogId }}"><svg class="icon" aria-hidden="true"><use href="#navbar-help"/></svg><span>Bantuan</span></button>
    </nav>
    @if ($account)
        <div class="homepage-account{{ $isAdventure ? ' adventure-account' : '' }}">
            <button class="button button--primary navbar__login homepage-account__toggle" type="button" aria-expanded="false" aria-controls="navbar-account-menu">
                <span class="homepage-account__avatar" aria-hidden="true"><img src="{{ asset($account->profileAvatarPath()) }}" alt="" width="1024" height="1448" decoding="async"></span>
                <span class="homepage-account__name">{{ $account->name }}</span>
                <svg class="icon homepage-account__chevron" aria-hidden="true"><use href="#navbar-chevron"/></svg>
            </button>
            <div class="homepage-account__menu" id="navbar-account-menu" hidden>
                <span class="homepage-account__label">Masuk sebagai</span>
                <strong>{{ $account->name }}</strong>
                <span class="homepage-account__email">{{ $account->email }}</span>
                @include('game-music-settings')
                <form action="{{ route('logout') }}" method="post" data-logout>@csrf<button type="submit"><svg class="icon" aria-hidden="true"><use href="#navbar-logout"/></svg>Keluar</button></form>
            </div>
        </div>
    @else
        <a class="button button--primary navbar__login" href="{{ route('login') }}" data-page-link="login"><svg class="icon" aria-hidden="true"><use href="#navbar-user"/></svg><span>Login</span></a>
    @endif
</header>
